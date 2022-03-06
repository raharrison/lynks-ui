import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {EntryFilter, SortDirection} from "@shared/models/entry-filter.model";
import {EntryType} from "@shared/models";

@Injectable({
  providedIn: 'root'
})
export class EntryFilterService {

  readonly DEFAULT_FILTER: EntryFilter = {
    page: 1,
    size: 25,
    tags: [],
    collections: [],
    sort: "dateUpdated",
    direction: SortDirection.DESC,
    entryType: EntryType.ENTRIES
  }

  private entryFilter = {...this.DEFAULT_FILTER};

  private entryFilterSubject = new BehaviorSubject<EntryFilter>(this.DEFAULT_FILTER);
  $entryFilter = this.entryFilterSubject.asObservable();

  private filterUpdated() {
    this.entryFilterSubject.next(this.entryFilter);
  }

  setPage(newPage: number) {
    this.entryFilter.page = newPage;
    this.filterUpdated();
  }

  setFilter(entryFilter: EntryFilter) {
    this.entryFilter = entryFilter;
    this.filterUpdated();
  }

  reset(entryType: EntryType = EntryType.ENTRIES) {
    this.entryFilter = {
      ...this.DEFAULT_FILTER,
      entryType: entryType
    };
    this.filterUpdated();
  }

  resetAll() {
    const entryType = this.entryFilter.entryType;
    this.entryFilter = {
      ...this.DEFAULT_FILTER,
      entryType: entryType
    };
    this.filterUpdated();
  }
}
