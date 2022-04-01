import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {EntryType, SlimSnippet} from "@shared/models";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-snippet-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './snippet-list-item.component.html',
  styleUrls: ['./snippet-list-item.component.scss']
})
export class SnippetListItemComponent {

  @Input()
  snippet: SlimSnippet;

  snippetPath: string;

  constructor(private routeProvider: RouteProviderService) {
    this.snippetPath = this.routeProvider.entryDefsByType[EntryType.SNIPPET].path;
  }

}
