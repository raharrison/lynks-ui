import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

@Component({
  selector: 'lks-time-ago',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-ago.component.html'
})
export class TimeAgoComponent implements OnInit, OnChanges {

  @Input()
  date: number;

  @Input()
  prefix: string;

  formattedDate: string;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.formattedDate = this.getDateString(this.date);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.formattedDate = this.getDateString(this.date);
    this.changeDetectorRef.markForCheck();
  }

  getDateString(dateNum: number) {
    if (dateNum == null) {
      return "";
    }

    let d = new Date(this.date);
    let now = new Date();
    let seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
    let minutes = Math.round(Math.abs(seconds / 60));
    let hours = Math.round(Math.abs(minutes / 60));
    let days = Math.round(Math.abs(hours / 24));
    let months = Math.round(Math.abs(days / 30.416));
    let years = Math.round(Math.abs(days / 365));

    if (Number.isNaN(seconds)) {
      return '';
    } else if (seconds <= 45) {
      return 'just now';
    } else if (seconds <= 90) {
      return 'a minute ago';
    } else if (minutes <= 45) {
      return minutes + ' minutes ago';
    } else if (minutes <= 90) {
      return 'an hour ago';
    } else if (hours <= 22) {
      return hours + ' hours ago';
    } else if (hours <= 36) {
      return 'a day ago';
    } else if (days <= 25) {
      return days + ' days ago';
    } else if (days <= 45) {
      return 'a month ago';
    } else if (days <= 345) {
      return months + ' months ago';
    } else if (days <= 545) {
      return 'a year ago';
    } else { // (days > 545)
      return years + ' years ago';
    }
  }

}
