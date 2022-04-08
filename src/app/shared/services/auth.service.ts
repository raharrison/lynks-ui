import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient} from "@angular/common/http";
import {Observable, ReplaySubject, switchMap, tap} from 'rxjs';
import {AuthRequest, User} from "@shared/models";
import {ResponseHandlerService} from "@shared/services/response-handler.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private http: HttpClient;
  private userSubject: ReplaySubject<User> = new ReplaySubject(1);

  constructor(private responseHandler: ResponseHandlerService,
              httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend); // prevent cyclic dependency
    this.getCurrentUser().subscribe();
  }

  set user(user: User) {
    this.userSubject.next(user);
  }

  get user$(): Observable<User> {
    return this.userSubject.asObservable();
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>("/api/user")
      .pipe(tap({
        next: user => this.user = user,
        error: () => this.logoutUser()
      }));
  }

  login(loginRequest: AuthRequest): Observable<User> {
    return this.http.post("/api/login", loginRequest)
      .pipe(
        switchMap(() => this.getCurrentUser()),
        tap({error: () => this.logoutUser()}),
        this.responseHandler.handleResponseError("Unable to login, check your details"),
      );
  }

  logout(): Observable<any> {
    return this.http.post("/api/logout", null)
      .pipe(
        tap(() => this.logoutUser()),
        this.responseHandler.handleResponse("Successfully logged out", "Unable to logout at this time")
      );
  }

  logoutUser() {
    this.user = null;
  }

  register(user: AuthRequest): Observable<User> {
    return this.http.post<User>("/api/user/register", user)
      .pipe(this.responseHandler.handleResponse("New user successfully registered", "Unable to register new user at this time"));
  }
}
