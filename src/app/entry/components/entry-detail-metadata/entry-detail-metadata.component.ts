import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Entry, EntryType, Link} from "@shared/models";

@Component({
  selector: 'lks-entry-detail-metadata',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-detail-metadata.component.html',
  styleUrls: ['./entry-detail-metadata.component.scss']
})
export class EntryDetailMetadataComponent {

  @Input()
  entry: Entry;

  EntryType = EntryType;

  constructor() {
  }

  isLinkRead(): boolean {
    return this.entry?.props.attributes?.read == true;
  }

  getLinkSource(): string {
    return (this.entry as Link).source;
  }
}
