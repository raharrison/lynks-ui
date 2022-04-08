import {Component, OnInit} from '@angular/core';
import {AuthService} from "@shared/services/auth.service";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {User} from "@shared/models";

@Component({
  selector: 'lks-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  user: User;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: user => {
        this.user = user;
        this.loadingStatus = LoadingStatus.LOADED;
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }

}
