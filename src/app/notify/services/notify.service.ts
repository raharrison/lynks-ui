import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Notification} from "@app/notify/models";
import {Page} from "@shared/models/page.model";
import {HttpClient} from "@angular/common/http";
import {ResponseHandlerService} from "@shared/services";
import {SortConfig, SortDirection} from "@shared/models/sort-config.model";

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getNotifications(page: number, sortConfig: SortConfig): Observable<Page<Notification>> {
    const params: any = {
      page: page,
      size: 5
    };
    if (sortConfig.sort != "dateCreated") {
      params.direction = sortConfig.direction;
    }
    if (sortConfig.direction != SortDirection.DESC) {
      params.direction = sortConfig.direction;
    }
    return this.http.get<Page<Notification>>("/api/notifications", {params})
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve notificfations"));
  }

  markRead(notificationId: string) {
    return this.http.post(`/api/notifications/${notificationId}/read`, null)
      .pipe(this.responseHandler.handleResponseError("Unable to mark notification as read"));
  }

}
