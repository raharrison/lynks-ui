import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Router} from "@angular/router";
import {catchError, Observable, throwError} from 'rxjs';
import {UserService} from "@shared/services/user.service";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router,
              private routeProvider: RouteProviderService,
              private userService: UserService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request)
      .pipe(catchError(err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.userService.logoutUser();
              this.router.navigate([this.routeProvider.loginPath]);
            }
          }
          return throwError(err);
        }
      ));
  }
}
