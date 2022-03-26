import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Notification} from "@app/notify/models";
import {Page} from "@shared/models/page.model";
import {HttpClient} from "@angular/common/http";
import {ResponseHandlerService} from "@shared/services";

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getNotifications(): Observable<Page<Notification>> {
    return this.http.get<Page<Notification>>("/api/notifications")
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve notificfations"));
  }

  markRead(notificationId: string) {
    return this.http.post(`/api/notifications/${notificationId}/read`, null)
      .pipe(this.responseHandler.handleResponseError("Unable to mark notification as read"));
  }

}
