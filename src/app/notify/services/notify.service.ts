import {Injectable, OnDestroy} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable, ReplaySubject, Subscription} from "rxjs";
import {map, tap} from "rxjs/operators";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {Page} from "@shared/models/page.model";
import {SortConfig, SortDirection} from "@shared/models/sort-config.model";
import {Notification, NotificationType} from "@app/notify/models";
import {AuthService} from "@shared/services/auth.service";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {ToastrService} from "ngx-toastr";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Injectable({
  providedIn: 'root'
})
export class NotifyService implements OnDestroy {

  private userSubscription: Subscription;

  private unreadCountSubject = new ReplaySubject<number>(1);
  $unreadCount: Observable<number> = this.unreadCountSubject.asObservable();

  private notificationSocket: WebSocketSubject<Notification>;

  constructor(private http: HttpClient,
              private toastrService: ToastrService,
              private routeProvider: RouteProviderService,
              private responseHandler: ResponseHandlerService,
              private authService: AuthService) {
    this.updateUnreadCount();
    this.createNotificationListener();
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

  private createNotificationListener() {
    const listenerUrl = NotifyService.constructListenerUrl();
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user != null) {
        this.closeNotificationListener();
        this.notificationSocket = webSocket(listenerUrl);
        this.notificationSocket.subscribe({
          next: message => this.handleNotificationMessage(message),
          error: err => {
            console.log("Notification websocket error");
            console.log(err);
          },
          complete: () => console.log("Notification websocket closed")
        });
      } else {
        // user logged out, terminate listener
        this.closeNotificationListener();
      }
    });
  }

  private handleNotificationMessage(notification: Notification) {
    const title = NotifyService.resolveNotificationTitle(notification);
    let message = notification.message;
    let opts = {enableHtml: false};
    if (notification.entryType != null) {
      const linkPath = `${this.routeProvider.entryDefsByType[notification.entryType].path}/${notification.entryId}`;
      const link = `<b><a href="${linkPath}">Go to entry</a></b>`;
      message = `${notification.message} <br> ${link}`
      opts = {enableHtml: true};
    }
    if (notification.type == NotificationType.ERROR) {
      this.toastrService.error(message, title, opts);
    } else {
      this.toastrService.info(message, title, opts);
    }
  }

  private static resolveNotificationTitle(notification: Notification): string {
    if (notification.type == NotificationType.DISCUSSIONS) {
      return "Discussions Found";
    } else if (notification.type == NotificationType.PROCESSED) {
      return "Processing Complete"
    } else if (notification.type == NotificationType.REMINDER) {
      return "Reminder Elapsed"
    } else if (notification.type == NotificationType.ERROR) {
      return "Error"
    } else {
      return null;
    }
  }

  private static constructListenerUrl(): string {
    let notifyUrl = window.location.protocol === "https:" ? "wss://" : "ws://";
    notifyUrl += window.location.host + "/api/notifications/updates";
    return notifyUrl;
  }

  private closeNotificationListener() {
    if (this.notificationSocket != null) {
      this.notificationSocket.complete();
      this.notificationSocket = null;
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription != null) {
      this.userSubscription.unsubscribe();
    }
    this.closeNotificationListener();
  }
}
