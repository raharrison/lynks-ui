import {Component, Input, OnInit} from '@angular/core';
import {AttachmentService} from "../../../services/attachment.service";
import {Attachment} from "../../../model/attachment.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DeleteConfirmModalComponent} from "../../utils/delete-confirm-modal/delete-confirm-modal.component";

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

  constructor(private attachmentService: AttachmentService,
              private modalService: NgbModal) { }

  ngOnInit(): void {
    this.retrieveAttachments();
  }

  private retrieveAttachments() {
    this.attachmentService.getAttachmentsForEntry(this.entryId).subscribe(value => {
      this.attachments = value;
      this.loaded = true;
    });
  }

  openDeleteModal(attachment) {
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.data = attachment;
    modalRef.componentInstance.type = "attachment";

    modalRef.result.then(closeData => {
      if(closeData) {
        this.deleteAttachment(closeData);
      }
    }, () => {});
  }

  private deleteAttachment(attachment: Attachment) {
    this.attachmentService.deleteAttachment(this.entryId, attachment.id).subscribe(_ => {
      this.retrieveAttachments();
    });
  }

  onAttachmentUploaded() {
    this.retrieveAttachments();
  }

  onDownloadClick(attachment: Attachment) {
    const url = this.attachmentService.createDownloadLink(this.entryId, attachment.id);
    window.open(url);
  }
}
