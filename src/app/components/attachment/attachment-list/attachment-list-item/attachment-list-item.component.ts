import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Attachment} from "../../../../model/attachment.model";
import {DeleteConfirmModalComponent} from "../../../utils/delete-confirm-modal/delete-confirm-modal.component";
import {AttachmentService} from "../../../../services/attachment.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'tr[app-attachment-list-item]',
  templateUrl: './attachment-list-item.component.html',
  styleUrls: ['./attachment-list-item.component.css']
})
export class AttachmentListItemComponent implements OnInit {

  @Input()
  entryId: string;

  @Input()
  attachment: Attachment;

  @Output()
  attachmentModified = new EventEmitter<Attachment>();

  editMode = false;
  attachmentNameInput: string;

  constructor(private attachmentService: AttachmentService,
              private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openDeleteModal(event: Event, attachment: Attachment) {
    event.stopPropagation();
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
    this.attachmentService.deleteAttachment(this.entryId, attachment.id)
        .subscribe(_ => {
          this.attachmentModified.emit(attachment);
        });
  }

  onDownloadClick(event: Event, attachment: Attachment) {
    event.stopPropagation();
    const url = this.attachmentService.createDownloadLink(this.entryId, attachment.id);
    window.open(url);
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.editMode = true;
    this.attachmentNameInput = this.attachment.name;
  }

  onSaveClick(event: Event) {
    event.stopPropagation();
    const updatedAttachment: Attachment = {
      ...this.attachment,
      name: this.attachmentNameInput
    };
    this.attachmentService.updateAttachment(this.entryId, updatedAttachment)
        .subscribe(res => {
          this.attachment = res;
          this.editMode = false;
          this.attachment.name = this.attachmentNameInput;
          this.attachmentNameInput = null;
        });
  }

  onEditCancelClick(event: Event) {
    event.stopPropagation();
    this.editMode = false;
    this.attachmentNameInput = null;
  }
}
