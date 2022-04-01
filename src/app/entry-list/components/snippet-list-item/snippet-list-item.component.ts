import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SlimSnippet} from "@shared/models";

@Component({
  selector: 'lks-snippet-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './snippet-list-item.component.html',
  styleUrls: ['./snippet-list-item.component.scss']
})
export class SnippetListItemComponent {

  @Input()
  snippet: SlimSnippet;

  constructor() {
  }

}
