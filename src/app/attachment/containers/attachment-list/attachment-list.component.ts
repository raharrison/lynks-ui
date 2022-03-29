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
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;

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
        this.loadingStatus = LoadingStatus.LOADED;
        this.onLoaded.emit(this.attachments);
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }
}
