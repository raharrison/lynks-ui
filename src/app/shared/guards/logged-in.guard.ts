import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, take} from 'rxjs';
import {map} from "rxjs/operators";
import {AuthService} from "@shared/services/auth.service";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {

  constructor(private router: Router,
              private routeProvider: RouteProviderService,
              private authService: AuthService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate([this.routeProvider.loginPath]);
          return false;
        }
        return true;
      })
    );
  }

}
