import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Collection} from "../model/group.model";
import {ResponseHandlerService} from "./response-handler.service";

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getCollections(): Observable<[Collection]> {
    return this.http.get<[Collection]>("/api/collection")
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve collections"));
  }
}
