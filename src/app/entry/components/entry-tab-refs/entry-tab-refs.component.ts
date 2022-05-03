import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Entry, EntryRefSet} from "@shared/models";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {EntryService} from "@app/entry/services/entry.service";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-entry-tab-refs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-tab-refs.component.html',
  styleUrls: ['./entry-tab-refs.component.scss']
})
export class EntryTabRefsComponent implements OnInit {

  @Input()
  entry: Entry;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  entryRefSet: EntryRefSet;

  constructor(public routeProvider: RouteProviderService,
              private entryService: EntryService) {
  }

  ngOnInit(): void {
    this.loadingStatus = LoadingStatus.LOADING;
    this.entryService.getRefs(this.entry.id).subscribe({
      next: data => {
        this.loadingStatus = LoadingStatus.LOADED;
        this.entryRefSet = data;
        this.onLoaded.emit(this.entryRefSet.inbound.length || this.entryRefSet.outbound.length);
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }
}
