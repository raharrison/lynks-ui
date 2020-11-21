import {Injectable} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {tap} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ResponseHandlerService {

  constructor(private toastrService: ToastrService) {
  }

  handleResponseError<T>(errorMessage: string) {
    return tap<T>({
      error: (error) => {
        ResponseHandlerService.handleError(error);
        this.toastrService.error(errorMessage, "Error");
      }
    });
  }

  handleResponse<T>(successMessage: string, errorMessage: string) {
    return tap<T>(() => {
      this.toastrService.success(successMessage, "Success");
    }, error => {
      ResponseHandlerService.handleError(error);
      if (error.error) {
        this.toastrService.error(`${errorMessage}: ${error.error}`, "Error");
      } else {
        this.toastrService.error(errorMessage, "Error");
      }
    });
  }

  handleResponseFilter<T>(successFilter: (e: T) => boolean, successMessage: string, errorMessage: string) {
    return tap<T>((event) => {
      if (successFilter(event)) {
        this.toastrService.success(successMessage, "Success");
      }
    }, error => {
      ResponseHandlerService.handleError(error);
      this.toastrService.error(errorMessage, "Error");
    });
  }

  private static handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };
}
