import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {NewNote, Note} from "../model/note.model";
import {ResponseHandlerService} from "./response-handler.service";

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getNotes(): Observable<Note> {
    return this.http.get<Note>("/api/note")
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve notes"));
  }

  getNote(id: string): Observable<Note> {
    return this.http.get<Note>("/api/note/" + id)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve note"));
  }

  createNote(newNote: NewNote): Observable<Note> {
    return this.http.post<Note>("/api/note", newNote)
      .pipe(this.responseHandler.handleResponse("Note created", "Unable to create note"));
  }

  updateNote(newNote: NewNote): Observable<Note> {
    return this.http.put<Note>("/api/note", newNote)
      .pipe(this.responseHandler.handleResponse("Note updated", "Unable to update note"));
  }

  delete(id: string): Observable<any> {
    return this.http.delete("/api/note/" + id)
      .pipe(this.responseHandler.handleResponse("Note deleted", "Unable to delete note"));
  }
}
