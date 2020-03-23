import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "./response-handler.service";
import {Link, NewLink, Suggestion} from "../model/link.model";
import {EntryResource} from "./entry.service";

@Injectable({
  providedIn: 'root'
})
export class LinkService implements EntryResource<Link> {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getPage(): Observable<Link[]> {
    return this.http.get<Link[]>("/api/link")
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve links"));
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

  update(newLink: NewLink): Observable<Link> {
    return this.http.put<Link>("/api/link", newLink)
      .pipe(this.responseHandler.handleResponse("Link updated", "Unable to update link"));
  }

  delete(id: string): Observable<any> {
    return this.http.delete("/api/link/" + id)
      .pipe(this.responseHandler.handleResponse("Link deleted", "Unable to delete link"));
  }

  suggest(url: string): Observable<Suggestion> {
    return this.http.post<Suggestion>("/api/suggest/", url)
      .pipe(this.responseHandler.handleResponse("Suggestion complete", "Unable to perform link suggestion"));
  }

  constructTempUrl(base: string): string {
    return `/api/temp/${base}`;
  }
}
