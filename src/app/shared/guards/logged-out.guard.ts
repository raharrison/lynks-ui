import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable, take} from 'rxjs';
import {map} from "rxjs/operators";
import {UserService} from "@shared/services/user.service";

@Injectable({
  providedIn: 'root'
})
export class LoggedOutGuard implements CanActivate {

  constructor(private router: Router,
              private userService: UserService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.userService.user$.pipe(
      take(1),
      map(user => {
        if (user) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }

}
