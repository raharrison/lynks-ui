import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Link, NewLink, SlimLink, Suggestion} from "@shared/models";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {EntryResource} from "@app/entry/services/entry-resource";

@Injectable({
  providedIn: 'root'
})
export class LinkService implements EntryResource<SlimLink, Link> {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  get(id: string): Observable<Link> {
    return this.http.get<Link>("/api/link/" + id)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve link"));
  }

  getVersion(id: string, version: string): Observable<Link> {
    return this.http.get<Link>(`/api/link/${id}/${version}`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve link version " + version));
  }

  create(newLink: NewLink): Observable<Link> {
    return this.http.post<Link>("/api/link", newLink)
      .pipe(this.responseHandler.handleResponse("Link created", "Unable to create link"));
  }

  update(newLink: NewLink, newVersion: boolean): Observable<Link> {
    return this.http.put<Link>("/api/link", newLink, {params: {newVersion}})
      .pipe(this.responseHandler.handleResponse("Link updated", "Unable to update link"));
  }

  delete(id: string): Observable<any> {
    return this.http.delete("/api/link/" + id)
      .pipe(this.responseHandler.handleResponse("Link deleted", "Unable to delete link"));
  }

  suggest(url: string): Observable<Suggestion> {
    return this.http.post<Suggestion>("/api/suggest", url)
      .pipe(this.responseHandler.handleResponse("Suggestion complete", "Unable to perform link suggestion"));
  }

  constructPath(id?: string, version?: string): string[] {
    if (id == undefined) {
      return ["/links"];
    }
    if (version == undefined) {
      return ["/links", id];
    }
    return ["/links", id, version];
  }

  constructTempUrl(base: string): string {
    return `/api/temp/${base}`;
  }

  launch(id: string) {
    window.open(`/api/link/${id}/launch`, "_blank");
  }

  checkExistingWithUrl(url: string): Observable<SlimLink[]> {
    return this.http.post<SlimLink[]>("/api/link/checkExisting", url);
  }

}
