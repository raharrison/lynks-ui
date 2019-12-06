import {Component, OnInit} from '@angular/core';
import {Note} from "../../../model/note.model";
import {ActivatedRoute} from "@angular/router";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.css']
})
export class NoteDetailComponent implements OnInit {

  note: Note;
  loaded = false;

  constructor(private route: ActivatedRoute, private httpClient: HttpClient) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    this.httpClient.get<Note>("/api/note/" + id).subscribe((data) => {
      this.note = data;
      this.loaded = true;
    });
  }

}
