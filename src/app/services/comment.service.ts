import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Comment} from "../model/comment.model";

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

  getCommentsForEntry(entryId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`/api/entry/${entryId}/comments`);
  }
}
