import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Discussion} from "@shared/models";

@Component({
  selector: 'lks-entry-tab-discussion-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-tab-discussion-list.component.html',
  styleUrls: ['./entry-tab-discussion-list.component.scss']
})
export class EntryTabDiscussionListComponent {

  @Input()
  discussions: Discussion[];

  createLinkUrl(discussion: Discussion): string {
    if (discussion.url.startsWith("/r/")) {
      return "https://old.reddit.com" + discussion.url;
    }
    return discussion.url;
  }

}
