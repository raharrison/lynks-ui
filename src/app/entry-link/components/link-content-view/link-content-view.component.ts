import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Link} from "@shared/models";

@Component({
  selector: 'lks-link-content-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link-content-view.component.html',
  styleUrls: ['./link-content-view.component.scss']
})
export class LinkContentViewComponent {

  @Input()
  link: Link;

  isContentCollapsed = true;
  isEmbedFrameCollapsed = true;
  isSummaryCollapsed = true;

  constructor() {
  }

}
