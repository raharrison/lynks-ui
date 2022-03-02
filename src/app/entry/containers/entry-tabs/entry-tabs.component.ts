import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Entry} from "@shared/models";

@Component({
  selector: 'lks-entry-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-tabs.component.html',
  styleUrls: ['./entry-tabs.component.scss']
})
export class EntryTabsComponent implements OnInit {

  @Input()
  entry: Entry;

  activeTab: string;

  commentCount: number;
  taskCount: number;
  discussionCount: number;
  reminderCount: number = 0;
  historyCount: number;
  auditCount: number;

  constructor(public route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.taskCount = this.entry?.props?.tasks?.length;
    this.discussionCount = this.entry?.props?.attributes?.discussions?.length;

    this.route.fragment.subscribe(value => {
      this.activeTab = value || "comments";
    })
  }

}
