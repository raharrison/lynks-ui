import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Entry, EntryVersion} from "../../../../model/entry.model";
import {EntryService} from "../../../../services/entry.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-entry-history',
  templateUrl: './entry-history.component.html',
  styleUrls: ['./entry-history.component.css']
})
export class EntryHistoryComponent implements OnInit {

  @Input()
  entry: Entry;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  history: EntryVersion[];

  constructor(private entryService: EntryService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.entryService.getHistory(this.entry.id).subscribe(value => {
      this.history = value;
      this.onLoaded.emit(this.history.length);
    });
  }

  goToVersionPath(version) {
    return this.entryService.resolveService(this.entry.type)
      .constructPath(this.entry.id, version);
  }
}
