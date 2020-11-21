import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'lks-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit {

  @Input()
  small: boolean = false;

  @Input()
  loading: boolean = false;

  spinnerClasses = "spinner-border ";

  constructor() {
  }

  ngOnInit() {
    if (!this.small) {
      this.spinnerClasses += "center-loading"
    }
  }

}
