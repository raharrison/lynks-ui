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
  type: string;

  @Input()
  placeholder: boolean = true;

  @Input()
  minimal: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  iconClass() {
    if (this.type == "collections") {
      return "fas fa-layer-group";
    } else if (this.type == "tags") {
      return "fas fa-tag";
    } else {
      return "";
    }
  }

}
