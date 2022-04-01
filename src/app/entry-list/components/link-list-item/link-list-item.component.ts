import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {EntryType, SlimLink} from "@shared/models";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-link-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link-list-item.component.html',
  styleUrls: ['./link-list-item.component.scss']
})
export class LinkListItemComponent {

  @Input()
  link: SlimLink;

  linkPath: string;

  constructor(private routeProvider: RouteProviderService) {
    this.linkPath = this.routeProvider.entryDefsByType[EntryType.LINK].path;
  }

}
