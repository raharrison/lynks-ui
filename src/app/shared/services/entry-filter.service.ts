import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {EntryFilter} from "@shared/models/entry-filter.model";
import {EntryType} from "@shared/models";
import {SortConfig, SortDirection} from "@shared/models/sort-config.model";
import {ParamMap} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class EntryFilterService {

  readonly MOST_RELEVANT_SORT = "mostRelevant";

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

  setPage(newPage: number) {
    this.entryFilter.page = newPage;
    return this.nonDefaultConfig();
  }

  // apply filter settings from sort config over current filter
  applySortConfig(config: SortConfig) {
    this.entryFilter = {
      ...this.entryFilter,
      ...config
    };
    return this.nonDefaultConfig();
  }

  // completely overwrite filter with new definition
  setFilter(entryFilter: EntryFilter) {
    this.entryFilter = entryFilter;
    return this.nonDefaultConfig();
  }

  // set new entry type of current filter
  updateToType(entryType: EntryType): void {
    this.entryFilter.entryType = entryType;
  }

  // completely reset to defaults but keep old entry type
  resetAll() {
    this.entryFilter = {
      ...this.DEFAULT_FILTER,
      entryType: this.entryFilter.entryType
    };
    return this.nonDefaultConfig();
  }

  // set all filter settings from given query param map
  applyParams(params: ParamMap) {
    this.entryFilter = {
      ...this.DEFAULT_FILTER,
      entryType: this.entryFilter.entryType
    };
    if (params.has("page")) {
      this.entryFilter.page = Number(params.get("page"));
    }
    if (params.has("size")) {
      this.entryFilter.size = Number(params.get("size"));
    }
    if (params.has("source")) {
      this.entryFilter.source = params.get("source");
    }
    if (params.has("sort")) {
      this.entryFilter.sort = params.get("sort");
    }
    if (params.has("direction")) {
      this.entryFilter.direction = params.get("direction") as SortDirection;
    }
    if (params.has("q")) {
      this.entryFilter.searchTerms = params.get("q");
    }
    if (params.has("tags")) {
      this.entryFilter.tags = params.getAll("tags");
    }
    if (params.has("collections")) {
      this.entryFilter.collections = params.getAll("collections");
    }
    this.onFilterUpdated();
  }

  // compute all entry filter params that differ from the default
  private nonDefaultConfig() {
    const params: any = {};
    for (const [key, value] of Object.entries(this.entryFilter)) {
      if (this.DEFAULT_FILTER.hasOwnProperty(key) && value != this.DEFAULT_FILTER[key]) {
        params[key] = value;
      }
    }
    return params;
  }

  private onFilterUpdated() {
    // if no search term set reset back sort order
    if (this.entryFilter.searchTerms == '' && this.entryFilter.sort == this.MOST_RELEVANT_SORT) {
      this.entryFilter.sort = this.DEFAULT_FILTER.sort;
    }
    this.entryFilterSubject.next(this.entryFilter);
  }
}
