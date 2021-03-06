import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {EntryType, Note, SlimNote} from "@shared/models";
import {EntryResource, EntryService} from "@app/entry/services/entry.service";

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

  private entryResource: EntryResource<SlimNote, Note>;

  constructor(private route: ActivatedRoute,
              private entryService: EntryService) {
    this.entryResource = entryService.resolveService(EntryType.NOTE);
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
      this.entryResource.getVersion(this.id, this.version).subscribe((data) => {
        this.note = data;
        this.loading = false;
      });
    } else {
      this.entryResource.get(this.id).subscribe((data) => {
        this.note = data;
        this.loading = false;
      });
    }
  }
}
