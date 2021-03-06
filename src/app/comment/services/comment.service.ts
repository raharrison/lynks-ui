import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {Comment, NewComment} from "@app/comment/models";
import {Page} from "@shared/models/page.model";

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getCommentsForEntry(entryId: string): Observable<Page<Comment>> {
    return this.http.get<Page<Comment>>(`/api/entry/${entryId}/comments`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve comments for entry"));
  }

  createComment(entryId: string, newComment: NewComment) {
    return this.http.post<Comment>(`/api/entry/${entryId}/comments`, newComment)
      .pipe(this.responseHandler.handleResponse("Comment created", "Unable to create comment"));
  }

  updateComment(entryId: string, newComment: NewComment) {
    return this.http.put<Comment>(`/api/entry/${entryId}/comments`, newComment)
      .pipe(this.responseHandler.handleResponse("Comment updated", "Unable to update comment"));
  }

  deleteComment(entryId: string, commentId: string) {
    return this.http.delete(`/api/entry/${entryId}/comments/${commentId}`)
      .pipe(this.responseHandler.handleResponse("Comment deleted", "Unable to delete comment"));
  }

}
