import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {UserUpdateRequest} from "@app/user/models/user-update-request.model";
import {ChangePasswordRequest} from "@app/user/models";
import {User} from "@shared/models";
import {ActivityLogItem} from "@app/user/models/activity-log-item.model";
import {Page} from "@shared/models/page.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  updateProfile(updateRequest: UserUpdateRequest): Observable<User> {
    return this.http.put<User>("/api/user", updateRequest)
      .pipe(this.responseHandler.handleResponse("User profile successfully updated", "Unable to update user profile"));
  }

  changePassword(changeRequest: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>("/api/user/changePassword", changeRequest)
      .pipe(this.responseHandler.handleResponse("Password successfully changed", "Unable to change your password"));
  }

  getActivityLog(page: number): Observable<Page<ActivityLogItem>> {
    const params: any = {
      page: page
    };
    return this.http.get<Page<ActivityLogItem>>("/api/user/activity", {params})
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve activity log data"));
  }

}
