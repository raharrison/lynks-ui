import {Component, OnDestroy, OnInit} from '@angular/core';
import {EntryFilterService} from "@shared/services/entry-filter.service";
import {EntryFilter} from "@shared/models/entry-filter.model";
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {Collection, Tag} from "@shared/models";

@Component({
  selector: 'lks-entry-filter-edit',
  templateUrl: './entry-filter-edit.component.html',
  styleUrls: ['./entry-filter-edit.component.scss']
})
export class EntryFilterEditComponent implements OnInit, OnDestroy {

  entryFilter: EntryFilter;
  private entryFilterSubscription: Subscription;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private entryFilterService: EntryFilterService) {
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

  setNewFilterTags(tags: Tag[]) {
    this.entryFilter.tags = tags.map(tag => tag.id);
  }

  setNewFilterCollections(collections: Collection[]) {
    this.entryFilter.collections = collections.map(collection => collection.id);
  }

  onSubmit() {
    const queryParams = this.entryFilterService.setFilter(this.entryFilter);
    this.router.navigate(
      ['.'],
      {
        relativeTo: this.route,
        queryParams: queryParams
      });
  }

  resetFilter() {
    const queryParams = this.entryFilterService.resetAll();
    this.router.navigate(
      ['.'],
      {
        relativeTo: this.route,
        queryParams: queryParams
      });
  }
}
