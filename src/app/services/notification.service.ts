import {Injectable} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {Notification, NotificationType} from "../model/notification.model";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationWebSocket: WebSocketSubject<Notification>;

  constructor(private toastrService: ToastrService) {
    this.createNotificationSubscription();
  }

  private createNotificationSubscription() {
    const wsUrl = `ws://localhost:8080/api/notify`;
    this.notificationWebSocket = webSocket(wsUrl);

    this.notificationWebSocket.subscribe(
      msg => this.handleNotification(msg),
      () => console.log("Error connecting to the websocket"),
      () => this.toastrService.warning("The notification websocket was closed")
    );
  }

  private handleNotification(notification: Notification) {
    if (notification.type == NotificationType.DISCUSSIONS) {
      const title = "Discussion Found";
      const message = notification.message + " for: " + notification.body.title;
      this.toastrService.info(message, title);
    } else if (notification.type == NotificationType.EXECUTED) {
      const title = notification.message;
      const message = `Processing complete for ${notification.type}: ${notification.body.title}`;
      this.toastrService.info(message, title);
    } else {
      const title = `${notification.message} on ${notification.entity}`;
      this.toastrService.info(JSON.stringify(notification.body), title);
    }
  }
}
