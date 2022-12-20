import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'lks-confirm-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent {

  @Input()
  prompt: string;

  constructor(public activeModal: NgbActiveModal) {
  }

}
