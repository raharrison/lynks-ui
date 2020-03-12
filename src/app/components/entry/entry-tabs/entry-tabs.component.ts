import {Component, Input, OnInit} from '@angular/core';
import {Entry} from "../../../model/entry.model";

@Component({
  selector: 'app-entry-tabs',
  templateUrl: './entry-tabs.component.html',
  styleUrls: ['./entry-tabs.component.css']
})
export class EntryTabsComponent implements OnInit {

  @Input()
  entry: Entry;

  constructor() {
  }

  ngOnInit(): void {
  }

}
