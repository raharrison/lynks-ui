import {Component, Input, OnInit} from '@angular/core';
import {AttachmentService} from "../../../services/attachment.service";
import {Attachment} from "../../../model/attachment.model";

@Component({
  selector: 'app-attachment-list',
  templateUrl: './attachment-list.component.html',
  styleUrls: ['./attachment-list.component.css']
})
export class AttachmentListComponent implements OnInit {

  @Input()
  entryId: string;

  attachments: Attachment[] = [];

  loaded = false;

  constructor(private attachmentService: AttachmentService) { }

  ngOnInit(): void {
    this.retrieveAttachments();
  }

  retrieveAttachments() {
    this.attachmentService.getAttachmentsForEntry(this.entryId).subscribe(value => {
      this.attachments = value;
      this.loaded = true;
    });
  }
}
