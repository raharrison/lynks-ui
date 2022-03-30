import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, ReplaySubject} from "rxjs";
import {ResponseHandlerService} from "./response-handler.service";
import {Collection, NewCollection} from "@shared/models";

@Injectable({
  providedIn: 'root'
})
export class CollectionService {

  private collectionsSubject = new ReplaySubject<Collection[]>(1);
  $collections: Observable<Collection[]> = this.collectionsSubject.asObservable();

  private collectionsFlattenedSubject = new ReplaySubject<Collection[]>(1);
  $collectionsFlattened: Observable<Collection[]> = this.collectionsFlattenedSubject.asObservable();

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
    this.collectionsSubject.next([]);
    this.collectionsFlattenedSubject.next([]);
    this.refreshCollections();
  }

  refreshCollections() {
    this.http.get<Collection[]>("/api/collection")
      .pipe(
        this.responseHandler.handleResponseError("Unable to retrieve collections")
      ).subscribe(collections => {
      const flat = new Array<Collection>();
      this.flattenCollections(collections, flat);
      const retrievedCollections = collections.sort((a, b) => a.name.localeCompare(b.name));
      const retrievedFlatCollections = flat.sort((a, b) => a.name.localeCompare(b.name));
      this.collectionsSubject.next(retrievedCollections);
      this.collectionsFlattenedSubject.next(retrievedFlatCollections);
    });
  }

  private flattenCollections(cols: Collection[], accum: Collection[]) {
    for (let col of cols) {
      accum.push(col);
      if (col.children.length > 0) {
        this.flattenCollections(col.children, accum);
      }
    }
  }

  createCollection(collection: NewCollection): Observable<Collection> {
    return this.http.post<Collection>(`/api/collection`, collection)
      .pipe(this.responseHandler.handleResponse("Collection created", "Unable to create collection"));
  }

  updateCollection(collection: NewCollection): Observable<Collection> {
    return this.http.put<Collection>(`/api/collection`, collection)
      .pipe(this.responseHandler.handleResponse("Collection updated", "Unable to update collection"));
  }

  deleteCollection(id: string): Observable<any> {
    return this.http.delete(`/api/collection/${id}`)
      .pipe(this.responseHandler.handleResponse("Collection deleted", "Unable to delete collection"));
  }
}
