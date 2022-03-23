import {Entry, SlimEntry} from "@shared/models";
import {Observable} from "rxjs";

export interface EntryResource<S extends SlimEntry, T extends Entry> {
  get(id: string): Observable<T>;

  getVersion(id: string, version: string): Observable<T>;

  create(model): Observable<T>;

  update(model, newVersion: boolean): Observable<T>;

  delete(id: string): Observable<any>;

  constructPath(id?: string, version?: string): string[];
}
