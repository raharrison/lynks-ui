import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, take} from 'rxjs';
import {map} from "rxjs/operators";
import {UserService} from "@shared/services/user.service";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {

  constructor(private router: Router,
              private routeProvider: RouteProviderService,
              private userService: UserService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.userService.user$.pipe(
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
