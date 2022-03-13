import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Collection, NewNote, Tag} from "@shared/models";
import {NoteService} from "@app/entry/services/note.service";

@Component({
  selector: 'lks-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent implements OnInit {

  loading = false;
  saving = false;
  updateMode = false;
  note: NewNote;

  selectedTags: Tag[] = [];
  selectedCollections: Collection[] = [];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private noteService: NoteService) {
  }

  ngOnInit() {
    this.note = {
      id: null,
      tags: [],
      collections: [],
      title: "",
      plainText: "",
    };
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      // update mode
      this.updateMode = true;
      this.loading = true;
      this.noteService.get(id).subscribe((data) => {
        this.note.id = data.id;
        this.note.title = data.title;
        this.note.plainText = data.plainText;
        this.selectedTags = data.tags;
        this.selectedCollections = data.collections;
        this.loading = false;
      });
    }
  }

  onCancel() {
    if (this.updateMode) {
      this.router.navigate(["/entries/notes", this.note.id]);
    } else {
      this.router.navigate(["/entries/notes"]);
    }
  }

  onSubmit(saveNewVersion: boolean) {
    this.note.tags = this.selectedTags.map(t => t.id);
    this.note.collections = this.selectedCollections.map(c => c.id);
    this.saving = true;
    if (this.updateMode) {
      this.updateNote(saveNewVersion);
    } else {
      this.createNote();
    }
  }

  createNote() {
    this.noteService.create(this.note)
      .subscribe({
        next: data => {
          this.saving = false;
          this.router.navigate(["/notes", data.id]);
        },
        error: () => {
          this.saving = false;
        }
      });
  }

  updateNote(saveNewVersion: boolean) {
    this.noteService.update(this.note, saveNewVersion)
      .subscribe({
        next: data => {
          this.saving = false;
          this.router.navigate(["/notes", data.id]);
        },
        error: () => {
          this.saving = false;
        }
      });
  }

}
