import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NoteService} from "./note.service";
import {LinkService} from "./link.service";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {Entry, EntryAuditItem, EntryType, EntryVersion, SlimEntry} from "@shared/models";
import {Page} from "@shared/models/page.model";

export interface EntryResource<S extends SlimEntry, T extends Entry> {
  getPage(): Observable<Page<S>>;

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
              private noteService: NoteService,
              private linkService: LinkService) {
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
