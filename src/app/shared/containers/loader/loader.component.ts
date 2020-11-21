import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'lks-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loader.component.html'
})
export class LoaderComponent {

  @Input()
  small: boolean = false;

  @Input()
  loading: boolean = false;

  constructor() {
  }

}
