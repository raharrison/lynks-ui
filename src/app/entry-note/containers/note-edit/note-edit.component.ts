import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Collection, NewNote, Note, Tag} from "@shared/models";
import {NoteService} from "@app/entry/services/note.service";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.scss']
})
export class NoteEditComponent implements OnInit {

  loadingStatus: LoadingStatus = LoadingStatus.LOADED;
  saving = false;
  updateMode = false;

  note: NewNote;
  private oldNote: Note;

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
      this.updateMode = true;
      this.loadingStatus = LoadingStatus.LOADING;
      this.noteService.get(id).subscribe({
        next: data => {
          this.oldNote = data;
          this.note.id = data.id;
          this.note.title = data.title;
          this.note.plainText = data.plainText;
          this.selectedTags = data.tags;
          this.selectedCollections = data.collections;
          this.loadingStatus = LoadingStatus.LOADED;
        }, error: () => {
          this.loadingStatus = LoadingStatus.ERROR;
        }
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

  private createNote() {
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

  private updateNote(saveNewVersion: boolean) {
    // only save new version if main fields have changed
    const forceNewVersion = NoteEditComponent.checkFieldChanges(this.oldNote, this.note) ? saveNewVersion : false;
    this.noteService.update(this.note, forceNewVersion)
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

  private static checkFieldChanges(oldNote: Note, newNote: NewNote): boolean {
    if (oldNote.title !== newNote.title) return true;
    else if (oldNote.plainText !== newNote.plainText) return true;
    return false;
  }

}
