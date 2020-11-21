import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "./response-handler.service";
import {Tag} from "@shared/models";

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getTags(): Observable<[Tag]> {
    return this.http.get<[Tag]>("/api/tag")
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve tags"));
  }
}
