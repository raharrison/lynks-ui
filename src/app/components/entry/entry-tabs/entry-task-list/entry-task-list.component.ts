import {Component, Input, OnInit} from '@angular/core';
import {Entry} from "../../../../model/entry.model";
import {Task} from "../../../../model/task.model";
import {TaskService} from "../../../../services/task.service";

@Component({
  selector: 'app-entry-task-list',
  templateUrl: './entry-task-list.component.html',
  styleUrls: ['./entry-task-list.component.css']
})
export class EntryTaskListComponent implements OnInit {

  @Input()
  entry: Entry;

  constructor(private taskService: TaskService) {
  }

  ngOnInit(): void {
  }

  executeTask(task: Task) {
    this.taskService.runTask(this.entry.id, task.id).subscribe();
  }
}
