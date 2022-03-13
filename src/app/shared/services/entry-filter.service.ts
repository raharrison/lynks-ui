import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {EntryFilter} from "@shared/models/entry-filter.model";
import {EntryType} from "@shared/models";
import {SortConfig, SortDirection} from "@shared/models/sort-config.model";

@Injectable({
  providedIn: 'root'
})
export class EntryFilterService {

  readonly DEFAULT_FILTER: EntryFilter = {
    page: 1,
    size: 25,
    tags: [],
    collections: [],
    source: "",
    sort: "dateUpdated",
    direction: SortDirection.DESC,
    entryType: EntryType.ENTRIES,
    searchTerms: ""
  }

  readonly SORT_CONFIGS: SortConfig[] = [
    {name: "Recently Updated", sort: "dateUpdated", direction: SortDirection.DESC},
    {name: "Recently Created", sort: "dateCreated", direction: SortDirection.DESC},
    {name: "Oldest First", sort: "dateUpdated", direction: SortDirection.ASC}
  ];

  private entryFilter = {...this.DEFAULT_FILTER};

  private entryFilterSubject = new BehaviorSubject<EntryFilter>(this.DEFAULT_FILTER);
  $entryFilter = this.entryFilterSubject.asObservable();

  private filterUpdated() {
    this.entryFilterSubject.next(this.entryFilter);
  }

  // only set page property of current filter
  setPage(newPage: number) {
    this.entryFilter.page = newPage;
    this.filterUpdated();
  }

  applySort(config: SortConfig) {
    this.entryFilter = {
      ...this.entryFilter,
      ...config
    };
    this.filterUpdated();
  }

  // completely overwrite filter with new definition
  setFilter(entryFilter: EntryFilter) {
    this.entryFilter = entryFilter;
    this.filterUpdated();
  }

  // set search term property of current filter
  setSearch(searchTerms: string) {
    this.entryFilter.searchTerms = searchTerms;
    this.entryFilter.entryType = EntryType.ENTRIES;
    this.filterUpdated();
  }

  // set new entry type of current filter
  updateToType(entryType: EntryType) {
    this.entryFilter.entryType = entryType;
    this.filterUpdated();
  }

  // reset to defaults but add provided entry type
  resetToType(entryType: EntryType = EntryType.ENTRIES) {
    this.entryFilter = {
      ...this.DEFAULT_FILTER,
      entryType: entryType
    };
    this.filterUpdated();
  }

  // completely reset to defaults but keep old entry type
  resetAll() {
    const entryType = this.entryFilter.entryType;
    this.entryFilter = {
      ...this.DEFAULT_FILTER,
      entryType: entryType
    };
    this.filterUpdated();
  }
}
