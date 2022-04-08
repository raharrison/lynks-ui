import {Component, OnInit} from '@angular/core';
import {UserService} from "@app/user/services/user.service";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {Page} from "@shared/models/page.model";
import {ActivityLogItem} from "@app/user/models/activity-log-item.model";
import {EntryType} from "@shared/models";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-user-activity-log',
  templateUrl: './user-activity-log.component.html',
  styleUrls: ['./user-activity-log.component.scss']
})
export class UserActivityLogComponent implements OnInit {

  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  activityPage: Page<ActivityLogItem>;
  currentPage: number = 1;

  constructor(private routeProvider: RouteProviderService,
              private userService: UserService) {
  }

  ngOnInit(): void {
    this.loadActivityLog();
  }

  loadActivityLog() {
    this.loadingStatus = LoadingStatus.LOADING;
    this.userService.getActivityLog(this.currentPage).subscribe({
      next: activityItems => {
        this.loadingStatus = LoadingStatus.LOADED;
        this.activityPage = activityItems;
      },
      error: _ => {
        this.loadingStatus = LoadingStatus.ERROR;
      }
    });
  }

  onPageChange(newPage: number) {
    this.currentPage = newPage;
    this.loadActivityLog();
  }

  resolveEntryHref(entryType?: EntryType): string {
    if (!entryType) {
      return this.routeProvider.baseEntryPath;
    }
    return this.routeProvider.entryDefsByType[entryType].path;
  }

  resolveEntryIcon(entryType: EntryType): string {
    return "fa-" + this.routeProvider.entryDefsByType[entryType].icon;
  }

}
