import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Entry, EntryType, EntryVersion} from "../model/entry.model";
import {HttpClient} from "@angular/common/http";
import {ResponseHandlerService} from "./response-handler.service";
import {NoteService} from "./note.service";
import {LinkService} from "./link.service";

export interface EntryResource<T extends Entry> {
  getPage(): Observable<T[]>;

  get(id: string): Observable<T>;

  getVersion(id: string, version: string): Observable<T>;

  create(model): Observable<T>;

  update(model): Observable<T>;

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

  resolveService(type: EntryType): EntryResource<any> {
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

  star(id: string, star: boolean): Observable<Entry> {
    const starPath = star ? "star" : "unstar";
    return this.http.post<Entry>(`/api/entry/${id}/${starPath}`, null)
      .pipe(this.responseHandler.handleResponseError(`Unable to ${starPath} entry`));
  }


}
