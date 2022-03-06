import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, switchMap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NoteService} from "./note.service";
import {LinkService} from "./link.service";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {Entry, EntryAuditItem, EntryType, EntryVersion, SlimEntry} from "@shared/models";
import {Page} from "@shared/models/page.model";
import {EntryFilterService} from "@app/entry/services/entry-filter.service";
import {tap} from "rxjs/operators";
import {EntryFilter} from "@shared/models/entry-filter.model";

export interface EntryResource<S extends SlimEntry, T extends Entry> {
  get(id: string): Observable<T>;

  getVersion(id: string, version: string): Observable<T>;

  create(model): Observable<T>;

  update(model, newVersion: boolean): Observable<T>;

  delete(id: string): Observable<any>;

  constructPath(id?: string, version?: string): string[];
}

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService,
              private entryFilterService: EntryFilterService,
              private noteService: NoteService,
              private linkService: LinkService) {
  }

  private entriesLoadingSubject = new BehaviorSubject<boolean>(true);
  $entriesLoading = this.entriesLoadingSubject.asObservable();

  $entryPage = this.getPage();

  private getPage(): Observable<Page<SlimEntry>> {
    return this.entryFilterService.$entryFilter
      .pipe(switchMap(filter => {
        this.entriesLoadingSubject.next(true);
        const entryType = filter.entryType.toLowerCase();
        const opts = {
          params: this.constructFilterParams(filter)
        }
        return this.http.get<Page<SlimEntry>>(`/api/${entryType}`, opts)
          .pipe(tap({
            next: _ => this.entriesLoadingSubject.next(false),
            error: _ => this.entriesLoadingSubject.next(false)
          }));
      }));
  }

  constructFilterParams(filter: EntryFilter) {
    const params: any = {
      page: filter.page
    };
    if (this.entryFilterService.DEFAULT_FILTER.size != filter.size) {
      params.size = filter.size;
    }
    if (this.entryFilterService.DEFAULT_FILTER.sort != filter.sort) {
      params.sort = filter.sort;
    }
    if (this.entryFilterService.DEFAULT_FILTER.direction != filter.direction) {
      params.direction = filter.direction;
    }
    if (filter.tags.length > 0) {
      params.tag = filter.tags.map(t => t.id);
    }
    if (filter.collections.length > 0) {
      params.collection = filter.collections.map(t => t.id);
    }
    return params;
  }

  resolveService(type: EntryType): EntryResource<any, any> {
    if (type == EntryType.LINK) {
      return this.linkService;
    } else if (type == EntryType.NOTE) {
      return this.noteService;
    } else {
      throw new TypeError("Unknown entry type: " + type);
    }
  }

  getHistory(id: string): Observable<EntryVersion[]> {
    return this.http.get<EntryVersion[]>(`/api/entry/${id}/history`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve entry history"));
  }

  getAudit(id: string): Observable<EntryAuditItem[]> {
    return this.http.get<EntryAuditItem[]>(`/api/entry/${id}/audit`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve entry audit"));
  }

  star(id: string, star: boolean): Observable<Entry> {
    const starPath = star ? "star" : "unstar";
    return this.http.post<Entry>(`/api/entry/${id}/${starPath}`, null)
      .pipe(this.responseHandler.handleResponseError(`Unable to ${starPath} entry`));
  }


}
