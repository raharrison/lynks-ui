import {Component, OnInit} from '@angular/core';
import {NotifyService} from "@app/notify/services";
import {Notification} from "@app/notify/models";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {Page} from "@shared/models/page.model";
import {EntryType} from "@shared/models";
import {SortConfig, SortDirection} from "@shared/models/sort-config.model";

@Component({
  selector: 'lks-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent implements OnInit {

  readonly SORT_CONFIGS: SortConfig[] = [
    {name: "Unread First", sort: "read", direction: SortDirection.ASC},
    {name: "Newest First", sort: "dateCreated", direction: SortDirection.DESC},
    {name: "Oldest First", sort: "dateCreated", direction: SortDirection.ASC}
  ];

  private sortConfig = this.SORT_CONFIGS[1];
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  notificationPage: Page<Notification>;
  currentPage: number = 1;

  constructor(private notifyService: NotifyService) {
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loadingStatus = LoadingStatus.LOADING;
    this.notifyService.getNotifications(this.currentPage, this.sortConfig).subscribe({
      next: notifications => {
        this.loadingStatus = LoadingStatus.LOADED;
        this.notificationPage = notifications;
      },
      error: _ => {
        this.loadingStatus = LoadingStatus.ERROR;
      }
    });
  }

  applySort(config: SortConfig) {
    this.sortConfig = config;
    this.loadNotifications();
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.loadNotifications();
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
