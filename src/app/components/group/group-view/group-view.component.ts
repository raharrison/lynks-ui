import {Component, Input, OnInit} from '@angular/core';
import {Collection, Tag} from "../../../model/group.model";

@Component({
  selector: 'app-group-view',
  templateUrl: './group-view.component.html',
  styleUrls: ['./group-view.component.css']
})
export class GroupViewComponent implements OnInit {

  @Input()
  groups: Tag[] | Collection[];

  @Input()
  prefix: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
