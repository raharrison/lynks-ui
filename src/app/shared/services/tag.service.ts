import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "./response-handler.service";
import {NewTag, Tag} from "@shared/models";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getTags(): Observable<[Tag]> {
    return this.http.get<[Tag]>("/api/tag")
      .pipe(
        map(tags => tags.sort((a, b) => a.name.localeCompare(b.name))),
        this.responseHandler.handleResponseError("Unable to retrieve tags")
      );
  }

  createTag(tag: NewTag): Observable<Tag> {
    return this.http.post<Tag>(`/api/tag`, tag)
      .pipe(this.responseHandler.handleResponse("Tag created", "Unable to create tag"));
  }

  updateTag(tag: NewTag): Observable<Tag> {
    return this.http.put<Tag>(`/api/tag`, tag)
      .pipe(this.responseHandler.handleResponse("Tag updated", "Unable to update tag"));
  }

  deleteTag(id: string): Observable<any> {
    return this.http.delete(`/api/tag/${id}`)
      .pipe(this.responseHandler.handleResponse("Tag deleted", "Unable to delete tag"));
  }

}
