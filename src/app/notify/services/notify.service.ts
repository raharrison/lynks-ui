import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "@shared/services";
import {Page} from "@shared/models/page.model";
import {SortConfig, SortDirection} from "@shared/models/sort-config.model";
import {Notification} from "@app/notify/models";

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getNotifications(page: number, sortConfig: SortConfig): Observable<Page<Notification>> {
    const params: any = {
      page: page
    };
    if (sortConfig.sort != "dateCreated") {
      params.sort = sortConfig.sort;
    }
    if (sortConfig.direction != SortDirection.DESC) {
      params.direction = sortConfig.direction;
    }
    return this.http.get<Page<Notification>>("/api/notifications", {params})
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve notifications"));
  }

  markRead(notificationId: string) {
    return this.http.post(`/api/notifications/${notificationId}/read`, null)
      .pipe(this.responseHandler.handleResponseError("Unable to mark notification as read"));
  }

  markAllRead() {
    return this.http.post(`/api/notifications/markAllRead`, null)
      .pipe(this.responseHandler.handleResponse("All notifications marked as read", "Unable to mark notifications as read"));
  }

}
