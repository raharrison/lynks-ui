import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Entry, EntryAuditItem} from "@shared/models";
import {EntryService} from "@app/entry/services/entry.service";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-entry-tab-audit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entry-tab-audit.component.html',
  styleUrls: ['./entry-tab-audit.component.scss']
})
export class EntryTabAuditComponent implements OnInit {

  @Input()
  entry: Entry;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  auditItems: EntryAuditItem[];

  constructor(private entryService: EntryService) {
  }

  ngOnInit(): void {
    this.loadingStatus = LoadingStatus.LOADING;
    this.entryService.getAudit(this.entry.id).subscribe({
      next: data => {
        this.loadingStatus = LoadingStatus.LOADED;
        this.auditItems = data;
        this.onLoaded.emit(this.auditItems.length);
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }

}
