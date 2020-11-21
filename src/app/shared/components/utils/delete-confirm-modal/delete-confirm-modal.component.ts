import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'lks-delete-confirm-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-confirm-modal.component.html'
})
export class DeleteConfirmModalComponent {

  @Input()
  data: any;

  @Input()
  type: string;

  constructor(public activeModal: NgbActiveModal) {
  }

}
