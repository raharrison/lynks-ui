import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SlimLink} from "@shared/models";

@Component({
  selector: 'lks-link-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link-list-item.component.html',
  styleUrls: ['./link-list-item.component.scss']
})
export class LinkListItemComponent {

  @Input()
  link: SlimLink;

  constructor() {
  }

}
