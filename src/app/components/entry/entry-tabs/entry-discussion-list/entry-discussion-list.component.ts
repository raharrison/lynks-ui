import {Component, Input} from '@angular/core';
import {Discussion} from "../../../../model/discussion.model";

@Component({
  selector: 'app-entry-discussion-list',
  templateUrl: './entry-discussion-list.component.html',
  styleUrls: ['./entry-discussion-list.component.css']
})
export class EntryDiscussionListComponent {

  @Input()
  discussions: Discussion[];

  createLinkUrl(discussion: Discussion): string {
    if (discussion.url.startsWith("/r/")) {
      return "https://old.reddit.com" + discussion.url;
    }
    return discussion.url;
  }

}
