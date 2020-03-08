import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-entry-tabs',
  templateUrl: './entry-tabs.component.html',
  styleUrls: ['./entry-tabs.component.css']
})
export class EntryTabsComponent implements OnInit {

  @Input()
  entryId: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
