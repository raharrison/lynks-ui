import {Component, OnInit} from '@angular/core';
import {Note} from "../../../../model/note.model";
import {ActivatedRoute, Router} from "@angular/router";
import {NoteService} from "../../../../services/note.service";

@Component({
  selector: 'app-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.css']
})
export class NoteDetailComponent implements OnInit {

  note: Note;
  loaded = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private noteService: NoteService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    this.noteService.getNote(id).subscribe((data) => {
      this.note = data;
      this.loaded = true;
    });
  }

    onDelete() {
      this.noteService.deleteNote(this.note.id).subscribe((data) => {
        this.router.navigate(["/notes"]);
      }, error => alert(error));
    }
}
