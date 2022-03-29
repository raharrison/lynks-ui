import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ReminderService} from "@app/reminder/services/reminder.service";
import {NotificationMethod, Reminder} from "@app/reminder/models";
import {Entry} from "@shared/models";
import {ReminderEditComponent} from "@app/reminder/components";
import {DeleteConfirmModalComponent} from "@shared/components";
import {TitleCasePipe} from "@angular/common";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-reminder-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reminder-list.component.html',
  styleUrls: ['./reminder-list.component.scss']
})
export class ReminderListComponent implements OnInit {

  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  reminders: Reminder[] = [];

  @Input()
  entry: Entry;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  constructor(private modalService: NgbModal,
              private titleCasePipe: TitleCasePipe,
              private reminderService: ReminderService) {
  }

  ngOnInit(): void {
    this.loadReminders();
  }

  private loadReminders() {
    this.loadingStatus = LoadingStatus.LOADING;
    this.reminderService.getReminders(this.entry.id).subscribe({
      next: data => {
        this.loadingStatus = LoadingStatus.LOADED;
        this.reminders = data;
        this.onLoaded.emit(data.length);
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }

  openCreateModal() {
    const modalRef = this.modalService.open(ReminderEditComponent, {ariaLabelledBy: 'modal-reminder-edit', size: "lg"});
    modalRef.componentInstance.entryId = this.entry.id;

    modalRef.result.then(closeData => {
      if (closeData) {
        this.loadReminders();
      }
    }, () => {
    });
  }

  onEditClick(event: Event, reminder: Reminder) {
    event.stopPropagation();
    const modalRef = this.modalService.open(ReminderEditComponent, {ariaLabelledBy: 'modal-reminder-edit', size: "lg"});
    modalRef.componentInstance.entryId = this.entry.id;
    modalRef.componentInstance.existingReminder = reminder;

    modalRef.result.then(closeData => {
      if (closeData) {
        this.loadReminders();
      }
    }, () => {
    });
  }

  openDeleteModal(event: Event, reminder: Reminder) {
    event.stopPropagation();
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.data = reminder;
    modalRef.componentInstance.type = "reminder";

    modalRef.result.then(closeData => {
      if (closeData) {
        this.reminderService.delete(reminder.reminderId)
          .subscribe(_ => {
            this.loadReminders();
          });
      }
    }, () => {
    });
  }

  formatAdhocReminderSpec(spec: string): string {
    return new Date(parseInt(spec)).toLocaleString();
  }

  formatNotifyMethods(methods: NotificationMethod[]): string {
    return methods.map(m => this.titleCasePipe.transform(m)).join(",");
  }

}
