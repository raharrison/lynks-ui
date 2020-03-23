import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {EntryVersion} from "../model/entry.model";
import {HttpClient} from "@angular/common/http";
import {ResponseHandlerService} from "./response-handler.service";

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getHistory(id: string): Observable<EntryVersion[]> {
    return this.http.get<EntryVersion[]>(`/api/entry/${id}/history`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve entry history"));
  }
}
