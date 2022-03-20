import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";

import {EntryType, SlimEntry} from "@shared/models";
import {Page} from "@shared/models/page.model";
import {EntryService} from "@app/entry/services/entry.service";
import {Subscription} from "rxjs";
import {EntryFilterService} from "@shared/services/entry-filter.service";
import {SortConfig} from "@shared/models/sort-config.model";

@Component({
  selector: 'lks-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent implements OnInit, OnDestroy {

  entryPage: Page<SlimEntry>;
  loading = true;
  entryFilterCollapsed = false;

  entryType: EntryType;
  entryTypeDesc: string;

  entrySubscription: Subscription;
  entriesLoadingSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              public entryFilterService: EntryFilterService,
              private entryService: EntryService) {
  }

  ngOnInit() {
    this.route.data.subscribe(value => {
      if (value.entryType) {
        this.entryType = value.entryType;
      } else {
        this.entryType = EntryType.ENTRIES;
      }
      this.entryFilterService.updateToType(this.entryType);

      if (this.entryType == EntryType.ENTRIES) {
        this.entryTypeDesc = "Entries";
      } else if (this.entryType == EntryType.NOTE) {
        this.entryTypeDesc = "Notes";
      } else if (this.entryType == EntryType.LINK) {
        this.entryTypeDesc = "Links";
      }

      this.entriesLoadingSubscription = this.entryService.$entriesLoading.subscribe(
        loading => this.loading = loading
      );
      this.entrySubscription = this.entryService.$entryPage.subscribe(page => {
        this.entryPage = page;
      })
    });
  }

  onPageChange(newPage: number) {
    this.entryFilterService.setPage(newPage);
  }

  applySort(config: SortConfig) {
    this.entryFilterService.applySort(config);
  }

  ngOnDestroy(): void {
    if (this.entriesLoadingSubscription != null) {
      this.entriesLoadingSubscription.unsubscribe();
    }
    if (this.entrySubscription != null) {
      this.entrySubscription.unsubscribe();
    }
  }
}
