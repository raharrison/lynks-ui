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

  commentCount: number;
  attachmentCount: number;
  taskCount: number;
  discussionCount: number;
  reminderCount: number = 0;
  historyCount: number;

  constructor() {
  }

  ngOnInit(): void {
    this.taskCount = this.entry?.props?.tasks?.length;
    this.discussionCount = this.entry?.props?.attributes?.discussions;
  }

}
