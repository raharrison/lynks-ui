import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {debounceTime, distinctUntilChanged, Subject, Subscription} from "rxjs";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {NewReminder, NotificationMethod, Reminder, ReminderStatus, ReminderType} from "@app/reminder/models";
import {ReminderService} from "@app/reminder/services/reminder.service";

@Component({
  selector: 'lks-reminder-edit',
  templateUrl: './reminder-edit.component.html',
  styleUrls: ['./reminder-edit.component.scss']
})
export class ReminderEditComponent implements OnInit, OnDestroy {

  @Input()
  entryId: string;

  @Input()
  existingReminder: Reminder;

  editingReminder: any = {};
  saving: boolean = false;

  isValidatingSchedule: boolean = false;
  fireTimes: string[] = [];
  recurringScheduleInvalidMessage: string = null;
  recurringScheduleFieldChanged = new Subject<string>();
  private recurringScheduleFieldSubscription: Subscription;

  constructor(public activeModal: NgbActiveModal,
              private reminderService: ReminderService) {
  }

  ngOnInit(): void {
    const defaultDate = new Date().toISOString().slice(0, 16);
    if (this.existingReminder) {
      this.editingReminder = {
        type: this.existingReminder.type,
        notifyMethods: this.existingReminder.notifyMethods,
        adhocSpec: this.existingReminder.type === ReminderType.ADHOC ?
          new Date(parseInt(this.existingReminder.spec)).toISOString().slice(0, 16) : defaultDate,
        recurringSpec: this.existingReminder.spec,
        message: this.existingReminder.message,
        enabled: this.existingReminder.status === ReminderStatus.ACTIVE
      };
    } else {
      this.editingReminder = {
        type: ReminderType.ADHOC,
        notifyMethods: [NotificationMethod.WEB],
        adhocSpec: defaultDate,
        recurringSpec: "",
        message: "",
        enabled: true
      };
    }

    this.recurringScheduleFieldSubscription = this.recurringScheduleFieldChanged.pipe(
      debounceTime(1000),
      distinctUntilChanged())
      .subscribe(schedule => this.validateRecurringSchedule(schedule));
  }

  onSaveReminder() {
    const newReminder = this.constructNewReminder(this.editingReminder);
    if (this.existingReminder) {
      this.updateReminder(newReminder);
    } else {
      this.createReminder(newReminder);
    }
  }

  private createReminder(newReminder: NewReminder) {
    this.saving = true;
    this.reminderService.create(newReminder)
      .subscribe({
        next: data => {
          this.saving = false;
          this.activeModal.close(data);
        },
        error: () => {
          this.saving = false;
        }
      });
  }

  private updateReminder(updatedReminder: NewReminder) {
    this.saving = true;
    this.reminderService.update(updatedReminder)
      .subscribe({
        next: data => {
          this.saving = false;
          this.activeModal.close(data);
        },
        error: () => {
          this.saving = false;
        }
      });
  }

  private constructNewReminder(editingReminder): NewReminder {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const spec = editingReminder.type == ReminderType.ADHOC ?
      Date.parse(editingReminder.adhocSpec).toString() : editingReminder.recurringSpec;
    return {
      entryId: this.entryId,
      reminderId: this.existingReminder ? this.existingReminder.reminderId : undefined,
      type: editingReminder.type,
      notifyMethods: editingReminder.notifyMethods,
      message: editingReminder.message,
      spec: spec,
      tz: tz,
      status: editingReminder.enabled ? ReminderStatus.ACTIVE : ReminderStatus.DISABLED
    }
  }

  private validateRecurringSchedule(schedule: string) {
    this.fireTimes = [];
    this.recurringScheduleInvalidMessage = null;
    this.isValidatingSchedule = false;
    if (schedule) {
      this.isValidatingSchedule = true;
      this.reminderService.validateSchedule(schedule).subscribe({
        next: fireTimes => {
          this.fireTimes = fireTimes;
          this.isValidatingSchedule = false;
        },
        error: err => {
          this.recurringScheduleInvalidMessage = err.error;
          this.isValidatingSchedule = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.recurringScheduleFieldSubscription != null) {
      this.recurringScheduleFieldSubscription.unsubscribe();
    }
  }

}
