import {Component, OnInit} from '@angular/core';
import {NotifyService} from "@app/notify/services";
import {Notification} from "@app/notify/models";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {Page} from "@shared/models/page.model";
import {EntryType} from "@shared/models";

@Component({
  selector: 'lks-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {

  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  notificationPage: Page<Notification>;

  constructor(private notifyService: NotifyService) {
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications() {
    this.loadingStatus = LoadingStatus.LOADING;
    this.notifyService.getNotifications().subscribe({
      next: notifications => {
        this.loadingStatus = LoadingStatus.LOADED;
        this.notificationPage = notifications;
      },
      error: _ => {
        this.loadingStatus = LoadingStatus.ERROR;
      }
    });
  }

  markRead(notification: Notification) {
    this.notifyService.markRead(notification.id).subscribe(_ => notification.read = true);
  }

  resolveEntryHref(entryType: EntryType): string {
    switch (entryType) {
      case EntryType.LINK:
        return "/links"
      case EntryType.NOTE:
        return "/notes"
      default:
        return "/entries"
    }
  }

}
