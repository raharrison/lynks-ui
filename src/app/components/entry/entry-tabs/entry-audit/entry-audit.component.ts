import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Entry, EntryAuditItem} from "../../../../model/entry.model";
import {EntryService} from "../../../../services/entry.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-entry-audit',
  templateUrl: './entry-audit.component.html',
  styleUrls: ['./entry-audit.component.css']
})
export class EntryAuditComponent implements OnInit {

  @Input()
  entry: Entry;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  auditItems: EntryAuditItem[];

  constructor(private entryService: EntryService, public route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.entryService.getAudit(this.entry.id).subscribe(value => {
      this.auditItems = value;
      this.onLoaded.emit(this.auditItems.length);
    });
  }

}
