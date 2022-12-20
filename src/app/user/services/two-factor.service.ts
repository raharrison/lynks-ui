import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {TwoFactorUpdateRequest, TwoFactorValidateRequest} from "@app/user/models";

@Injectable({
  providedIn: 'root'
})
export class TwoFactorService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getTwoFactorEnabled(): Observable<boolean> {
    return this.http.get<any>("/api/user/2fa")
      .pipe(
        map(res => res.enabled),
        this.responseHandler.handleResponseError("Unable to retrieve two-factor information")
      );
  }

  getTwoFactorSecret(): Observable<string> {
    return this.http.get<any>("/api/user/2fa/secret")
      .pipe(
        map(res => res.secret),
        this.responseHandler.handleResponseError("Unable to retrieve two-factor secret")
      );
  }

  validateTwoFactorCode(validateRequest: TwoFactorValidateRequest) {
    return this.http.post<any>("/api/user/2fa/validate", validateRequest)
      .pipe(
        map(res => res.valid),
        this.responseHandler.handleResponseError("Unable to validate two-factor code")
      );
  }

  updateTwoFactorEnabled(updateRequest: TwoFactorUpdateRequest): Observable<any> {
    return this.http.put<any>("/api/user/2fa", updateRequest)
      .pipe(this.responseHandler.handleResponse("Two-factor auth settings updated", "Unable to update two-factor auth settings"));
  }

}
