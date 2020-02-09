import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Note} from "../../../model/note.model";
import {ActivatedRoute, Router} from "@angular/router";
import {NoteService} from "../../../service/note.service";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Component({
  selector: 'app-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NoteDetailComponent implements OnInit {

  note: Note;
  loaded = false;
  safeHtml: SafeHtml;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private sanitizer: DomSanitizer,
              private noteService: NoteService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    this.noteService.getNote(id).subscribe((data) => {
      this.note = data;
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.note.markdownText);
      this.loaded = true;
    });
  }

    onDelete() {
      this.noteService.deleteNote(this.note.id).subscribe((data) => {
        this.router.navigate(["/notes"]);
      }, error => alert(error));
    }
}
