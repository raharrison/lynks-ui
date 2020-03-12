import {Component, Input, OnInit} from '@angular/core';
import {Entry} from "../../../../model/entry.model";

@Component({
  selector: 'app-entry-task-list',
  templateUrl: './entry-task-list.component.html',
  styleUrls: ['./entry-task-list.component.css']
})
export class EntryTaskListComponent implements OnInit {

  @Input()
  entry: Entry;

  constructor() {
  }

  ngOnInit(): void {
  }

}
