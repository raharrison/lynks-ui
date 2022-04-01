import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {EntryType, NewNote, Note, SlimNote} from "@shared/models";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {EntryResource} from "@app/entry/services/entry-resource";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Injectable({
  providedIn: 'root'
})
export class NoteService implements EntryResource<SlimNote, Note> {

  constructor(private http: HttpClient,
              private routeProvider: RouteProviderService,
              private responseHandler: ResponseHandlerService) {
  }

  get(id: string): Observable<Note> {
    return this.http.get<Note>("/api/note/" + id)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve note"));
  }

  getVersion(id: string, version: string): Observable<Note> {
    return this.http.get<Note>(`/api/note/${id}/${version}`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve note version " + version));
  }

  create(newNote: NewNote): Observable<Note> {
    return this.http.post<Note>("/api/note", newNote)
      .pipe(this.responseHandler.handleResponse("Note created", "Unable to create note"));
  }

  update(newNote: NewNote, newVersion: boolean): Observable<Note> {
    return this.http.put<Note>("/api/note", newNote, {params: {newVersion}})
      .pipe(this.responseHandler.handleResponse("Note updated", "Unable to update note"));
  }

  delete(id: string): Observable<any> {
    return this.http.delete("/api/note/" + id)
      .pipe(this.responseHandler.handleResponse("Note deleted", "Unable to delete note"));
  }

  constructPath(id?: string, version?: string): string[] {
    const base = this.routeProvider.entryDefsByType[EntryType.NOTE].path;
    if (id == undefined) {
      return [base];
    }
    if (version == undefined) {
      return [base, id];
    }
    return [base, id, version];
  }
}
