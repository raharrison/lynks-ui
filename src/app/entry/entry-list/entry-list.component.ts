import {Component, OnInit} from '@angular/core';
import {Entry} from "../../model/entry.model";
import {Note} from "../../model/note.model";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[];

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.httpClient.get<Array<Note>>("/api/note").subscribe((data) => {
      this.entries = data;
    });
  }

}
