import {Component, OnInit} from '@angular/core';
import {NoteService} from "../../../../services/note.service";
import {NewNote} from "../../../../model/note.model";
import {ActivatedRoute, Router} from "@angular/router";
import {Collection, Tag} from "../../../../model/group.model";

@Component({
  selector: 'app-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.css']
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

  ngOnInit(): void {
    this.note = {
      id: null,
      tags: [],
      collections: [],
      title: null,
      plainText: "",
    };
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      // update mode
      this.updateMode = true;
      this.loading = true;
      this.noteService.getNote(id).subscribe((data) => {
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
      this.router.navigate(["/notes", this.note.id]);
    } else {
      this.router.navigate(["/notes"]);
    }
  }

  onSubmit() {
    this.note.tags = this.selectedTags.map(t => t.id);
    this.note.collections = this.selectedCollections.map(c => c.id);
    this.saving = true;
    if (this.updateMode) {
      this.updateNote();
    } else {
      this.createNote();
    }
  }

  createNote() {
    this.noteService.createNote(this.note)
      .subscribe(
        data => {
          this.saving = false;
          this.router.navigate(["/notes", data.id]);
        });
  }

  updateNote() {
    this.noteService.updateNote(this.note)
      .subscribe(
        data => {
          this.saving = false;
          this.router.navigate(["/notes", data.id]);
        });
  }

}
