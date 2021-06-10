import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";

import {EntryType, SlimEntry} from "@shared/models";
import {Page} from "@shared/models/page.model";

@Component({
  selector: 'lks-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent implements OnInit {

  entries: SlimEntry[] = [];
  loading = true;

  entryType: EntryType;
  entryTypeDesc: string;

  constructor(private httpClient: HttpClient,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.data.subscribe(value => {
      if (value.entryType) {
        this.entryType = value.entryType;
      } else {
        this.entryType = EntryType.ENTRIES;
      }

      if (this.entryType == EntryType.ENTRIES) {
        this.entryTypeDesc = "Entries";
      } else if (this.entryType == EntryType.NOTE) {
        this.entryTypeDesc = "Notes";
      } else if (this.entryType == EntryType.LINK) {
        this.entryTypeDesc = "Links";
      }
      this.retrieveEntries();
    });
  }

  private retrieveEntries() {
    const entryPath = this.entryType.toLowerCase();
    this.httpClient.get<Page<SlimEntry>>(`/api/${entryPath}`).subscribe((data) => {
      this.loading = false;
      this.entries = data.content;
    });
  }
}
