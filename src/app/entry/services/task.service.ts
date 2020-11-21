import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ResponseHandlerService} from "@shared/services/response-handler.service";

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  runTask(entryId: string, taskId: string) {
    return this.http.post(`/api/entry/${entryId}/task/${taskId}`, null)
      .pipe(this.responseHandler.handleResponse("Task Executing", "Unable to execute task"));
  }
}
