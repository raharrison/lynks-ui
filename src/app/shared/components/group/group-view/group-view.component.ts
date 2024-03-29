import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Collection, Tag} from "@shared/models";

@Component({
  selector: 'lks-group-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group-view.component.html',
  styleUrls: ['./group-view.component.scss']
})
export class GroupViewComponent {

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

  iconClass() {
    if (this.type == "collections") {
      return "fa-solid fa-folder";
    } else if (this.type == "tags") {
      return "fa-solid fa-tag";
    } else {
      return "";
    }
  }

  createQueryParams(group: Tag | Collection) {
    return {
      [this.type]: group.id
    }
  }

}
