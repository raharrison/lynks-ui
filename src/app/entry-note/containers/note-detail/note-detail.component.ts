import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Note} from "@shared/models";
import {NoteService} from "@app/entry/services/note.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'lks-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.scss']
})
export class NoteDetailComponent implements OnInit {

  id;
  note: Note;
  version: string;
  loading = true;

  constructor(private route: ActivatedRoute,
              private titleService: Title,
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
      this.noteService.getVersion(this.id, this.version).subscribe((data) => {
        this.note = data;
        this.loading = false;
        this.titleService.setTitle("Lynks - " + data.title);
      });
    } else {
      this.noteService.get(this.id).subscribe((data) => {
        this.note = data;
        this.loading = false;
        this.titleService.setTitle("Lynks - " + data.title);
      });
    }
  }
}
