import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-delete-confirm-modal',
  templateUrl: './delete-confirm-modal.component.html'
})
export class DeleteConfirmModalComponent implements OnInit {

  @Input()
  data: any;

  @Input()
  type: string;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
  }

}
