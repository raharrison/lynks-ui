import {Component, Input, OnInit} from '@angular/core';
import {TaskDefinition, TaskParameterType} from "@shared/models";
import {TaskService} from "@app/entry/services/task.service";

@Component({
  selector: 'lks-entry-tab-task-exec',
  templateUrl: './entry-tab-task-exec.component.html',
  styleUrls: ['./entry-tab-task-exec.component.scss']
})
export class EntryTabTaskExecComponent implements OnInit {

  @Input()
  entryId: string;

  @Input()
  taskDefinition: TaskDefinition;

  model: object = {};

  constructor(private taskService: TaskService) {
  }

  ngOnInit(): void {
    this.taskDefinition.params.forEach(param => {
      if (param.type == TaskParameterType.ENUM) {
        this.model[param.name] = param.options[0];
      } else {
        this.model[param.name] = param.value;
      }
    });
  }

  onSubmit() {
    this.taskService.runTask(this.entryId, this.taskDefinition.id, this.model).subscribe();
  }

}
