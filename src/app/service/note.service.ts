import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {NewNote, Note} from "../model/note.model";

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient) { }

  getNotes(): Observable<Note> {
    return this.http.get<Note>("/api/note");
  }

  getNote(id: string): Observable<Note> {
    return this.http.get<Note>("/api/note/" + id);
  }

  createNote(newNote: NewNote): Observable<Note> {
    return this.http.post<Note>("/api/note", newNote);
  }

  updateNote(newNote: NewNote): Observable<Note> {
    return this.http.put<Note>("/api/note", newNote);
  }

  deleteNote(id: string): Observable<any> {
    return this.http.delete("/api/note/" + id);
  }
}
