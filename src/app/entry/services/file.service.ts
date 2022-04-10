import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {EntryType, File, NewFile, SlimFile} from "@shared/models";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {EntryResource} from "@app/entry/services/entry-resource";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Injectable({
  providedIn: 'root'
})
export class FileService implements EntryResource<SlimFile, File> {

  constructor(private http: HttpClient,
              private routeProvider: RouteProviderService,
              private responseHandler: ResponseHandlerService) {
  }

  get(id: string): Observable<File> {
    return this.http.get<File>("/api/file/" + id)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve file"));
  }

  getVersion(id: string, version: string): Observable<File> {
    return this.http.get<File>(`/api/file/${id}/${version}`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve file version " + version));
  }

  create(newFile: NewFile): Observable<File> {
    return this.http.post<File>("/api/file", newFile)
      .pipe(this.responseHandler.handleResponse("File created", "Unable to create file"));
  }

  update(newFile: NewFile, newVersion: boolean): Observable<File> {
    return this.http.put<File>("/api/file", newFile, {params: {newVersion}})
      .pipe(this.responseHandler.handleResponse("File updated", "Unable to update file"));
  }

  delete(id: string): Observable<any> {
    return this.http.delete("/api/file/" + id)
      .pipe(this.responseHandler.handleResponse("File deleted", "Unable to delete file"));
  }

  constructPath(id?: string, version?: string): string[] {
    const base = this.routeProvider.entryDefsByType[EntryType.FILE].path;
    if (id == undefined) {
      return [base];
    }
    if (version == undefined) {
      return [base, id];
    }
    return [base, id, version];
  }
}
