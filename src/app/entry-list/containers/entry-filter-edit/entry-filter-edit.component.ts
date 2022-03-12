import {Component, OnDestroy, OnInit} from '@angular/core';
import {EntryFilterService} from "@shared/services/entry-filter.service";
import {EntryFilter} from "@shared/models/entry-filter.model";
import {Subscription} from "rxjs";

@Component({
  selector: 'lks-entry-filter-edit',
  templateUrl: './entry-filter-edit.component.html',
  styleUrls: ['./entry-filter-edit.component.scss']
})
export class EntryFilterEditComponent implements OnInit, OnDestroy {

  entryFilter: EntryFilter;
  private entryFilterSubscription: Subscription;

  constructor(private entryFilterService: EntryFilterService) {
  }

  ngOnInit() {
    this.entryFilterSubscription = this.entryFilterService.$entryFilter
      .subscribe(filter => this.entryFilter = {...filter});
  }

  ngOnDestroy() {
    if (this.entryFilterSubscription != null) {
      this.entryFilterSubscription.unsubscribe();
    }
  }

  onSubmit() {
    this.entryFilterService.setFilter(this.entryFilter);
  }

  resetFilter() {
    this.entryFilterService.resetAll();
  }
}
