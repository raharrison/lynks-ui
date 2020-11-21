import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Entry, EntryVersion} from "@shared/models";
import {EntryService} from "@app/entry/services/entry.service";

@Component({
  selector: 'lks-entry-tab-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-tab-history.component.html',
  styleUrls: ['./entry-tab-history.component.scss']
})
export class EntryTabHistoryComponent implements OnInit {

  @Input()
  entry: Entry;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  history: EntryVersion[];

  constructor(private entryService: EntryService, public route: ActivatedRoute) {
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
