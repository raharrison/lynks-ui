import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {EntryType, EntryVersion} from "../model/entry.model";
import {HttpClient} from "@angular/common/http";
import {ResponseHandlerService} from "./response-handler.service";
import {NoteService} from "./note.service";
import {LinkService} from "./link.service";

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService,
              private noteService: NoteService,
              private linkService: LinkService) {
  }

  resolveService(type: EntryType): LinkService | NoteService {
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

  constructPath(entryType: EntryType, id: string, version: string = null) {
    const base = entryType.toLowerCase() + "s";
    if (version != null) {
      return ["/", base, id, version];
    }
    return ["/", base, id];
  }

}
