import {Component, OnInit} from '@angular/core';
import {Entry, EntryType} from "../../../model/entry.model";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[];
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
    this.httpClient.get<Array<Entry>>(`/api/${entryPath}`).subscribe((data) => {
      this.loading = false;
      this.entries = data;
    });
  }
}
