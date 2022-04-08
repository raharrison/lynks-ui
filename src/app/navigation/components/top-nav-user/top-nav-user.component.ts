import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from '@shared/services/auth.service';
import {Router} from "@angular/router";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-top-nav-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav-user.component.html',
  styleUrls: ['top-nav-user.component.scss'],
})
export class TopNavUserComponent {
  constructor(private router: Router,
              private routeProvider: RouteProviderService,
              public authService: AuthService) {
  }

  onLogoutSubmit() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate([this.routeProvider.loginPath])
    })
  }

}
