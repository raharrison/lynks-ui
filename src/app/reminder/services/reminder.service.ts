import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ResponseHandlerService} from "@shared/services/response-handler.service";
import {NewReminder, Reminder} from "@app/reminder/models";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  constructor(private http: HttpClient,
              private responseHandler: ResponseHandlerService) {
  }

  getReminders(entryId: string) {
    return this.http.get<Reminder[]>(`/api/entry/${entryId}/reminder`)
      .pipe(this.responseHandler.handleResponseError("Unable to retrieve reminders"));
  }

  create(newReminder: NewReminder): Observable<Reminder> {
    return this.http.post<Reminder>("/api/reminder", newReminder)
      .pipe(this.responseHandler.handleResponse("Reminder created", "Unable to create reminder"));
  }

  update(newReminder: NewReminder): Observable<Reminder> {
    return this.http.put<Reminder>("/api/reminder", newReminder)
      .pipe(this.responseHandler.handleResponse("Reminder updated", "Unable to update reminder"));
  }

  delete(id: string): Observable<any> {
    return this.http.delete("/api/reminder/" + id)
      .pipe(this.responseHandler.handleResponse("Reminder deleted", "Unable to delete reminder"));
  }

  validateSchedule(schedule: string): Observable<string[]> {
    return this.http.post<string[]>("/api/reminder/validate", schedule);
  }

}
