import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Entry} from "@shared/models";

@Component({
  selector: 'lks-entry-tab-task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-tab-task-list.component.html',
  styleUrls: ['./entry-tab-task-list.component.scss']
})
export class EntryTabTaskListComponent {

  @Input()
  entry: Entry;

  constructor() {
  }

}
