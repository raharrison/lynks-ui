import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Attachment} from "@app/attachment/models";
import {AttachmentService} from "@app/attachment/services/attachment.service";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.scss']
})
export class AttachmentListComponent implements OnInit {

  @Input()
  entryId: string;

  @Output()
  onLoaded: EventEmitter<Attachment[]> = new EventEmitter<Attachment[]>();

  attachments: Attachment[] = [];
  filteredAttachments: Attachment[] = [];
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;

  showVersions = false;
  currentVersions: { [key: string]: number };

  constructor(private attachmentService: AttachmentService) {
  }

  ngOnInit(): void {
    this.retrieveAttachments();
  }

  retrieveAttachments() {
    this.loadingStatus = LoadingStatus.LOADING;
    this.attachmentService.getAttachmentsForEntry(this.entryId).subscribe({
      next: data => {
        this.attachments = data;
        this.currentVersions = AttachmentListComponent.buildCurrentVersions(data);
        this.filterAttachments();
        this.loadingStatus = LoadingStatus.LOADED;
        this.onLoaded.emit(this.attachments);
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }

  filterAttachments() {
    if (this.showVersions) {
      this.filteredAttachments = this.attachments;
    } else {
      this.filteredAttachments = this.attachments.filter(a => this.currentVersions[a.parentId] === a.version);
    }
  }

  private static buildCurrentVersions(attachments: Attachment[]) {
    const currentVersions: { [key: string]: number } = {};
    attachments.forEach(attachment => {
      if (attachment.parentId in currentVersions) {
        if (attachment.version > currentVersions[attachment.parentId]) {
          currentVersions[attachment.parentId] = attachment.version;
        }
      } else {
        currentVersions[attachment.parentId] = attachment.version;
      }
    });
    return currentVersions;
  }

}
