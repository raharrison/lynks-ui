import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Entry, EntryAuditItem} from "@shared/models";
import {EntryService} from "@app/entry/services/entry.service";

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

  auditItems: EntryAuditItem[];

  constructor(private entryService: EntryService) {
  }

  ngOnInit(): void {
    this.entryService.getAudit(this.entry.id).subscribe(value => {
      this.auditItems = value;
      this.onLoaded.emit(this.auditItems.length);
    });
  }

}
