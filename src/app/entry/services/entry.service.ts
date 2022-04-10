import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, switchMap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NoteService} from "./note.service";
import {LinkService} from "./link.service";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {Entry, EntryAuditItem, EntryType, EntryVersion, SlimEntry} from "@shared/models";
import {Page} from "@shared/models/page.model";
import {EntryFilterService} from "@shared/services/entry-filter.service";
import {tap} from "rxjs/operators";
import {EntryFilter} from "@shared/models/entry-filter.model";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {EntryResource} from "@app/entry/services/entry-resource";
import {SnippetService} from "@app/entry/services/snippet.service";
import {FileService} from "@app/entry/services/file.service";

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService,
              private entryFilterService: EntryFilterService,
              private noteService: NoteService,
              private snippetService: SnippetService,
              private fileService: FileService,
              private linkService: LinkService) {
  }

  private entriesLoadingSubject = new BehaviorSubject<LoadingStatus>(LoadingStatus.LOADING);
  $entriesLoading = this.entriesLoadingSubject.asObservable();

  $entryPage = this.getPage();

  private getPage(): Observable<Page<SlimEntry>> {
    return this.entryFilterService.$entryFilter
      .pipe(
        switchMap(filter => {
          this.entriesLoadingSubject.next(LoadingStatus.LOADING);
          if (filter.q !== "") {
            return this.runSearchQuery(filter)
              .pipe(this.responseHandler.catchAndLogError("Unable to search entries"));
          } else {
            return this.runEntryQuery(filter)
              .pipe(this.responseHandler.catchAndLogError("Unable to load entries"));
          }
        })
      );
  }

  // api query with search terms for all entry types with page params
  private runSearchQuery(filter: EntryFilter) {
    const opts = {
      params: {
        ...this.constructFilterParams(filter),
        q: filter.q
      }
    }
    return this.http.get<Page<SlimEntry>>(`/api/entry/search`, opts)
      .pipe(tap({
        next: _ => this.entriesLoadingSubject.next(LoadingStatus.LOADED),
        error: _ => this.entriesLoadingSubject.next(LoadingStatus.ERROR)
      }));
  }

  // api query against specific type with page params
  private runEntryQuery(filter: EntryFilter) {
    const opts = {
      params: this.constructFilterParams(filter)
    }
    return this.http.get<Page<SlimEntry>>(`/api/${filter.entryType}`, opts)
      .pipe(tap({
        next: _ => this.entriesLoadingSubject.next(LoadingStatus.LOADED),
        error: _ => this.entriesLoadingSubject.next(LoadingStatus.ERROR)
      }));
  }

  private constructFilterParams(filter: EntryFilter) {
    const params: any = {
      page: filter.page
    };
    if (this.entryFilterService.DEFAULT_FILTER.size != filter.size) {
      params.size = filter.size;
    }
    if (filter.q == '') {
      if (this.entryFilterService.DEFAULT_FILTER.sort != filter.sort) {
        params.sort = filter.sort;
      }
    } else {
      // only add sort param if not set to most relevant (maps to date updated)
      if (this.entryFilterService.MOST_RELEVANT_SORT != filter.sort) {
        params.sort = filter.sort;
      }
    }
    if (this.entryFilterService.DEFAULT_FILTER.direction != filter.direction) {
      params.direction = filter.direction;
    }
    if (this.entryFilterService.DEFAULT_FILTER.source != filter.source) {
      params.source = filter.source;
    }
    if (filter.tags.length > 0) {
      params.tags = filter.tags.join(",");
    }
    if (filter.collections.length > 0) {
      params.collections = filter.collections.join(",");
    }
    return params;
  }

  resolveService(type: EntryType): EntryResource<any, any> {
    if (type == EntryType.LINK) {
      return this.linkService;
    } else if (type == EntryType.NOTE) {
      return this.noteService;
    } else if (type == EntryType.SNIPPET) {
      return this.snippetService;
    } else if (type == EntryType.FILE) {
      return this.fileService;
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
