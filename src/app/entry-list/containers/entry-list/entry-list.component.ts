import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

import {EntryType, SlimEntry} from "@shared/models";
import {Page} from "@shared/models/page.model";
import {EntryService} from "@app/entry/services/entry.service";
import {Subscription} from "rxjs";
import {EntryFilterService} from "@shared/services/entry-filter.service";
import {SortConfig} from "@shared/models/sort-config.model";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.scss']
})
export class EntryListComponent implements OnInit, OnDestroy {

  entryPage: Page<SlimEntry>;
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  entryFilterCollapsed = false;

  entryType: EntryType;
  entryTypeDesc: string;

  entrySubscription: Subscription;
  entriesLoadingSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              public entryFilterService: EntryFilterService,
              private entryService: EntryService) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const routeData = this.route.snapshot.data;
      if (routeData.entryType) {
        this.entryType = routeData.entryType;
      } else {
        this.entryType = EntryType.ENTRIES;
      }

      if (this.entryType == EntryType.ENTRIES) {
        this.entryTypeDesc = "Entries";
      } else if (this.entryType == EntryType.NOTE) {
        this.entryTypeDesc = "Notes";
      } else if (this.entryType == EntryType.LINK) {
        this.entryTypeDesc = "Links";
      } else if (this.entryType == EntryType.SNIPPET) {
        this.entryTypeDesc = "Snippets";
      }

      this.entryFilterService.updateToType(this.entryType);
      this.entryFilterService.applyParams(params);

      if (!this.entriesLoadingSubscription) {
        this.entriesLoadingSubscription = this.entryService.$entriesLoading.subscribe(
          loadingStatus => this.loadingStatus = loadingStatus
        );
      }
      if (!this.entrySubscription) {
        this.entrySubscription = this.entryService.$entryPage.subscribe(page => {
          this.entryPage = page;
        });
      }
    });
  }

  onPageChange(newPage: number) {
    const params = this.entryFilterService.setPage(newPage);
    this.applyFilterParams(params);
  }

  applySort(config: SortConfig) {
    const params = this.entryFilterService.applySortConfig(config);
    this.applyFilterParams(params);
  }

  private applyFilterParams(params) {
    this.router.navigate(
      ['.'],
      {
        relativeTo: this.route,
        queryParams: params
      });
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
