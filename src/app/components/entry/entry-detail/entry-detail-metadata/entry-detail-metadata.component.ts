import {Component, Input, OnInit} from '@angular/core';
import {Entry, EntryType} from "../../../../model/entry.model";
import {Link} from "../../../../model/link.model";

@Component({
  selector: 'app-entry-detail-metadata',
  templateUrl: './entry-detail-metadata.component.html',
  styleUrls: ['./entry-detail-metadata.component.css']
})
export class EntryDetailMetadataComponent implements OnInit {

  @Input()
  private entry: Entry;

  EntryType = EntryType;
  isContentCollapsed = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  isLinkRead(): boolean {
    return this.entry?.props.attributes?.read == true;
  }

  getLinkSource(): string {
    return (this.entry as Link).source;
  }
}
