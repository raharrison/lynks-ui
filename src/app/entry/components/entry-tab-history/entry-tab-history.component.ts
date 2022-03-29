import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Entry, EntryVersion} from "@shared/models";
import {EntryService} from "@app/entry/services/entry.service";
import {LoadingStatus} from "@shared/models/loading-status.model";

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

  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  history: EntryVersion[];

  constructor(private entryService: EntryService, public route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loadingStatus = LoadingStatus.LOADING;
    this.entryService.getHistory(this.entry.id).subscribe({
      next: data => {
        this.loadingStatus = LoadingStatus.LOADED;
        this.history = data;
        this.onLoaded.emit(this.history.length);
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }

  goToVersionPath(version) {
    return this.entryService.resolveService(this.entry.type)
      .constructPath(this.entry.id, version);
  }
}
