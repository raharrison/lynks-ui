import {Component, OnInit} from '@angular/core';
import {Entry} from "../../../model/entry.model";
import {Note} from "../../../model/note.model";
import {HttpClient} from "@angular/common/http";
import {Link} from "../../../model/link.model";

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[];

  constructor(private httpClient: HttpClient) { }

  ngOnInit() {
    this.httpClient.get<Array<Entry>>("/api/note").subscribe((data) => {
      this.entries = data.map(value => {
        if(value.type == "NOTE") return value as Note;
        else if(value.type == "LINK") return value as Link;
      });
    });
  }

}
