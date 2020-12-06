import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "./response-handler.service";
import {map} from "rxjs/operators";
import {Collection, NewCollection} from "@shared/models";

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getCollections(): Observable<[Collection]> {
    return this.http.get<[Collection]>("/api/collection")
      .pipe(
        map(collections => collections.sort((a, b) => a.name.localeCompare(b.name))),
        this.responseHandler.handleResponseError("Unable to retrieve collections")
      );
  }

  createCollection(collection: NewCollection): Observable<Collection> {
    return this.http.post<Collection>(`/api/collection/`, collection)
      .pipe(this.responseHandler.handleResponse("Collection created", "Unable to create collection"));
  }

  updateCollection(collection: NewCollection): Observable<Collection> {
    return this.http.put<Collection>(`/api/collection/`, collection)
      .pipe(this.responseHandler.handleResponse("Collection updated", "Unable to update collection"));
  }

  deleteCollection(id: string): Observable<any> {
    return this.http.delete(`/api/collection/${id}`)
      .pipe(this.responseHandler.handleResponse("Collection deleted", "Unable to delete collectionv"));
  }
}
