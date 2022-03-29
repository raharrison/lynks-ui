import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Note} from "@shared/models";
import {NoteService} from "@app/entry/services/note.service";
import {Title} from "@angular/platform-browser";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.scss']
})
export class NoteDetailComponent implements OnInit {

  id: string;
  note: Note;
  version: string;
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;

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

  private retrieveNote() {
    const observer = {
      next: data => {
        this.note = data;
        this.loadingStatus = LoadingStatus.LOADED;
        this.titleService.setTitle(data.title + " - Lynks");
      },
      error: _ => {
        this.loadingStatus = LoadingStatus.ERROR;
      }
    };
    if (this.version) {
      this.noteService.getVersion(this.id, this.version).subscribe(observer);
    } else {
      this.noteService.get(this.id).subscribe(observer);
    }
  }
}
