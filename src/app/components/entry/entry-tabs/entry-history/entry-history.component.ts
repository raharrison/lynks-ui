import {Component, Input, OnInit} from '@angular/core';
import {Entry, EntryVersion} from "../../../../model/entry.model";
import {EntryService} from "../../../../services/entry.service";

@Component({
  selector: 'app-entry-history',
  templateUrl: './entry-history.component.html',
  styleUrls: ['./entry-history.component.css']
})
export class EntryHistoryComponent implements OnInit {

  @Input()
  entry: Entry;
  history: EntryVersion[];

  constructor(private entryService: EntryService) {
  }

  ngOnInit(): void {
    this.entryService.getHistory(this.entry.id).subscribe(value => {
      this.history = value;
    });
  }

  goToVersionPath(version) {
    return this.entryService.resolveService(this.entry.type)
      .constructPath(this.entry.id, version);
  }
}
