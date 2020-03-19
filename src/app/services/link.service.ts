import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "./response-handler.service";
import {Link, NewLink, Suggestion} from "../model/link.model";

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getLinks(): Observable<Link> {
    return this.http.get<Link>("/api/link")
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve links"));
  }

  getLink(id: string): Observable<Link> {
    return this.http.get<Link>("/api/link/" + id)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve link"));
  }

  createLink(newLink: NewLink): Observable<Link> {
    return this.http.post<Link>("/api/link", newLink)
      .pipe(this.responseHandler.handleResponse("Link created", "Unable to create link"));
  }

  updateLink(newLink: NewLink): Observable<Link> {
    return this.http.put<Link>("/api/link", newLink)
      .pipe(this.responseHandler.handleResponse("Link updated", "Unable to update link"));
  }

  deleteLink(id: string): Observable<any> {
    return this.http.delete("/api/link/" + id)
      .pipe(this.responseHandler.handleResponse("Link deleted", "Unable to delete link"));
  }

  suggest(url: string): Observable<Suggestion> {
    return this.http.post<Suggestion>("/api/suggest/", url)
      .pipe(this.responseHandler.handleResponseError("Unable to perform link suggestion"));
  }
}
