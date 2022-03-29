import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loader.component.html'
})
export class LoaderComponent {

  LoadingStatus = LoadingStatus;

  @Input()
  small: boolean = false;

  @Input()
  loadingStatus: LoadingStatus;

  @Input()
  entity: string = "items"

  constructor() {
  }

}
