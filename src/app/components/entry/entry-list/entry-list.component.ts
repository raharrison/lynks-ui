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
  entryTypePath: string;

  constructor(private httpClient: HttpClient,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.data.subscribe(value => {
      if (value.entryType) {
        this.entryType = value.entryType;
      } else {
        this.entryTypePath = EntryType.ENTRIES;
      }
      this.entryTypePath = this.entryType.toLowerCase();
      this.retrieveEntries();
    });
  }

  private retrieveEntries() {
    this.httpClient.get<Array<Entry>>(`/api/${this.entryTypePath}`).subscribe((data) => {
      this.loading = false;
      this.entries = data;
    });
  }
}
