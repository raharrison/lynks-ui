import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "./response-handler.service";
import {Collection} from "@shared/models";

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
