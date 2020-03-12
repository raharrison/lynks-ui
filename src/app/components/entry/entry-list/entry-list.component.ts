import {Component, OnInit} from '@angular/core';
import {Entry} from "../../../model/entry.model";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[];
  loading = true;

  constructor(private httpClient: HttpClient) {
  }

  ngOnInit() {
    this.httpClient.get<Array<Entry>>("/api/entry").subscribe((data) => {
      this.loading = false;
      this.entries = data;
    });
  }

}
