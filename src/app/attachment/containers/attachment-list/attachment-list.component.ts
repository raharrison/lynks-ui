import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Attachment} from "@app/attachment/models";
import {AttachmentService} from "@app/attachment/services/attachment.service";

@Component({
  selector: 'lks-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.scss']
})
export class AttachmentListComponent implements OnInit {

  @Input()
  entryId: string;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  attachments: Attachment[] = [];

  loading = true;

  constructor(private attachmentService: AttachmentService) {
  }

  ngOnInit(): void {
    this.retrieveAttachments();
  }

  retrieveAttachments() {
    this.attachmentService.getAttachmentsForEntry(this.entryId).subscribe(value => {
      this.attachments = value;
      this.loading = false;
      this.onLoaded.emit(this.attachments.length);
    });
  }
}
