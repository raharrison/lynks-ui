import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {NoteService} from "../../../service/note.service";
import {NewNote} from "../../../model/note.model";
import {ActivatedRoute, Router} from "@angular/router";
import {TagService} from "../../../service/tag.service";
import {CollectionService} from "../../../service/collection.service";
import {Collection, Tag} from "../../../model/group.model";

@Component({
  selector: 'app-note-edit',
  templateUrl: './note-edit.component.html',
  styleUrls: ['./note-edit.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NoteEditComponent implements OnInit {

  updateMode = false;
  note: NewNote;

  allTags: Tag[] = [];
  allCollections: Collection[] = [];
  selectedTags: Tag[] = [];
  selectedCollections: Tag[] = [];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private noteService: NoteService,
              private tagService: TagService,
              private collectionService: CollectionService) { }

  ngOnInit(): void {
    this.note = {
      id: null,
      tags: [],
      collections: [],
      title: null,
      plainText: "",
    };
    this.tagService.getTags().subscribe((data) => {
      this.allTags = data;
    });
    this.collectionService.getCollections().subscribe((data) => {
      this.allCollections = data;
    });
    const id = this.route.snapshot.paramMap.get("id");
    if(id) {
      // update mode
      this.updateMode = true;
      this.noteService.getNote(id).subscribe((data) => {
        this.note.id = data.id;
        this.note.title = data.title;
        this.note.plainText = data.plainText;
        this.selectedTags = data.tags;
        this.selectedCollections = data.collections;
      });
    }
  }

  onCancel() {
    if(this.updateMode) {
      this.router.navigate(["/notes", this.note.id]);
    } else {
      this.router.navigate(["/notes"]);
    }
  }

  onSubmit() {
    this.note.tags = this.selectedTags.map(t => t.id);
    this.note.collections = this.selectedCollections.map(c => c.id);
    if(this.updateMode) {
      this.updateNote();
    } else {
      this.createNote();
    }
  }

  createNote() {
    this.noteService.createNote(this.note)
        .subscribe(
            data => {
              this.router.navigate(["/notes", data.id]);
            },
            error => {
              alert(error);
            });
  }

  updateNote() {
    this.noteService.updateNote(this.note)
        .subscribe(
            data => {
              this.router.navigate(["/notes", data.id]);
            },
            error => {
              alert(error);
            });
  }

}
