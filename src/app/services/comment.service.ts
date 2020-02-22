import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Comment, NewComment} from "../model/comment.model";

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient) { }

  getCommentsForEntry(entryId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`/api/entry/${entryId}/comments`);
  }

  createComment(entryId: string, newComment: NewComment) {
      return this.http.post<Comment>(`/api/entry/${entryId}/comments`, newComment);
  }

  updateComment(entryId: string, newComment: NewComment) {
    return this.http.put<Comment>(`/api/entry/${entryId}/comments`, newComment);
  }

  deleteComment(entryId: string, commentId: string) {
    return this.http.delete(`/api/entry/${entryId}/comments/${commentId}`);
  }

}
