import {Component, OnInit} from '@angular/core';
import {Note} from "../../../../model/note.model";
import {ActivatedRoute} from "@angular/router";
import {NoteService} from "../../../../services/note.service";

@Component({
  selector: 'app-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.css']
})
export class NoteDetailComponent implements OnInit {

  id;
  note: Note;
  version: string;
  loading = true;

  constructor(private route: ActivatedRoute,
              private noteService: NoteService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get("id");
      this.version = params.get("version");
      this.retrieveNote();
    });
  }

  retrieveNote() {
    if (this.version) {
      this.noteService.getNoteVersion(this.id, this.version).subscribe((data) => {
        this.note = data;
        this.loading = false;
      });
    } else {
      this.noteService.getNote(this.id).subscribe((data) => {
        this.note = data;
        this.loading = false;
      });
    }
  }
}
