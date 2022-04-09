import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, ReplaySubject} from "rxjs";
import {map, tap} from "rxjs/operators";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {Page} from "@shared/models/page.model";
import {SortConfig, SortDirection} from "@shared/models/sort-config.model";
import {Notification} from "@app/notify/models";

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  private unreadCountSubject = new ReplaySubject<number>(1);
  $unreadCount: Observable<number> = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
    this.updateUnreadCount();
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
      .pipe(
        tap(() => this.updateUnreadCount()),
        this.responseHandler.handleResponseError("Unable to retrieve notifications")
      );
  }

  markRead(notificationId: string): Observable<any> {
    return this.http.post(`/api/notifications/${notificationId}/read`, null)
      .pipe(
        tap(() => this.updateUnreadCount()),
        this.responseHandler.handleResponseError("Unable to mark notification as read")
      );
  }

  markAllRead(): Observable<any> {
    return this.http.post(`/api/notifications/markAllRead`, null)
      .pipe(
        tap(() => this.updateUnreadCount()),
        this.responseHandler.handleResponse("All notifications marked as read", "Unable to mark notifications as read")
      );
  }

  private updateUnreadCount() {
    this.http.get<any>("/api/notifications/unread")
      .pipe(map(e => e.unread))
      .subscribe(count => this.unreadCountSubject.next(count));
  }

}
