import {Component, OnInit} from '@angular/core';
import {Note} from "../../../../model/note.model";
import {ActivatedRoute, Router} from "@angular/router";
import {NoteService} from "../../../../services/note.service";
import {DeleteConfirmModalComponent} from "../../../utils/delete-confirm-modal/delete-confirm-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.css']
})
export class NoteDetailComponent implements OnInit {

  id;
  note: Note;
  loaded = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private modalService: NgbModal,
              private noteService: NoteService) { }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.noteService.getNote(this.id).subscribe((data) => {
      this.note = data;
      this.loaded = true;
    });
  }

  openDeleteModal() {
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.data = this.note;
    modalRef.componentInstance.type = "note";

    modalRef.result.then(closeData => {
      if(closeData) {
        this.deleteNote(closeData);
      }
    }, () => {});
  }

  private deleteNote(note: Note) {
    this.noteService.deleteNote(note.id).subscribe((data) => {
      this.router.navigate(["/notes"]);
    }, error => alert(error));
  }
}
