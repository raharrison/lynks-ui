import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {NewNote, Note} from "../model/note.model";
import {ToastrService} from "ngx-toastr";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private http: HttpClient, private toastrService: ToastrService) { }

  getNotes(): Observable<Note> {
    return this.http.get<Note>("/api/note");
  }

  getNote(id: string): Observable<Note> {
    return this.http.get<Note>("/api/note/" + id)
        .pipe(catchError(e => this.handleError(e, "Unable to retrieve note")));
  }

  createNote(newNote: NewNote): Observable<Note> {
    return this.http.post<Note>("/api/note", newNote)
        .pipe(catchError(e => this.handleError(e, "Unable to create note")));
  }

  updateNote(newNote: NewNote): Observable<Note> {
    return this.http.put<Note>("/api/note", newNote)
        .pipe(catchError(e => this.handleError(e, "Unable to update note")));
  }

  deleteNote(id: string): Observable<any> {
    return this.http.delete("/api/note/" + id)
        .pipe(catchError(e => this.handleError(e, "Unable to delete note")));
  }

  private handleError(error: HttpErrorResponse, message: string) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      const errorMessage = `Backend returned code ${error.status}, body was: ${error.error}`;
      console.error(errorMessage);
      this.toastrService.error(message + ": " + errorMessage, "Error Occurred");

    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };
}
