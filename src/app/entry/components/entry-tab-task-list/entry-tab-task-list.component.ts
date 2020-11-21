import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Entry, Task} from "@shared/models";
import {TaskService} from "@app/entry/services/task.service";

@Component({
  selector: 'lks-entry-tab-task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-tab-task-list.component.html',
  styleUrls: ['./entry-tab-task-list.component.scss']
})
export class EntryTabTaskListComponent {

  @Input()
  entry: Entry;

  constructor(private taskService: TaskService) {
  }

  executeTask(task: Task) {
    this.taskService.runTask(this.entry.id, task.id).subscribe();
  }
}
