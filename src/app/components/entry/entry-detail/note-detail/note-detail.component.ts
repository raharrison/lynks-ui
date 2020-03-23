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
  loading = true;

  constructor(private route: ActivatedRoute,
              private noteService: NoteService) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    const version = this.route.snapshot.paramMap.get("version");
    if (version) {
      this.noteService.getNoteVersion(this.id, version).subscribe((data) => {
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
