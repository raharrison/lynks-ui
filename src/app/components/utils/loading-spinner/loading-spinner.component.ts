import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent implements OnInit {

  @Input()
  small: boolean = false;

  spinnerClasses = "spinner-border ";

  constructor() {
  }

  ngOnInit() {
    if (!this.small) {
      this.spinnerClasses += "center-loading"
    }
  }

}
