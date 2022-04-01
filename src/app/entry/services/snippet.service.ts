import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {NewSnippet, SlimSnippet, Snippet} from "@shared/models";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {EntryResource} from "@app/entry/services/entry-resource";

@Injectable({
  providedIn: 'root'
})
export class SnippetService implements EntryResource<SlimSnippet, Snippet> {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  get(id: string): Observable<Snippet> {
    return this.http.get<Snippet>("/api/snippet/" + id)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve snippet"));
  }

  getVersion(id: string, version: string): Observable<Snippet> {
    return this.http.get<Snippet>(`/api/snippet/${id}/${version}`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve snippet version " + version));
  }

  create(newSnippet: NewSnippet): Observable<Snippet> {
    return this.http.post<Snippet>("/api/snippet", newSnippet)
      .pipe(this.responseHandler.handleResponse("Snippet created", "Unable to create snippet"));
  }

  update(newSnippet: NewSnippet, newVersion: boolean): Observable<Snippet> {
    return this.http.put<Snippet>("/api/snippet", newSnippet, {params: {newVersion}})
      .pipe(this.responseHandler.handleResponse("Snippet updated", "Unable to update snippet"));
  }

  delete(id: string): Observable<any> {
    return this.http.delete("/api/snippet/" + id)
      .pipe(this.responseHandler.handleResponse("Snippet deleted", "Unable to delete snippet"));
  }

  constructPath(id?: string, version?: string): string[] {
    if (id == undefined) {
      return ["/entries/snippets"];
    }
    if (version == undefined) {
      return ["/entries/snippets", id];
    }
    return ["/entries/snippets", id, version];
  }
}
