import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForm} from "@angular/forms";
import {HttpEvent, HttpEventType} from "@angular/common/http";
import {Attachment} from "@app/attachment/models";
import {AttachmentService} from "@app/attachment/services/attachment.service";

@Component({
  selector: 'lks-attachment-upload',
  templateUrl: './attachment-upload.component.html',
  styleUrls: ['./attachment-upload.component.scss']
})
export class AttachmentUploadComponent {

  @Input()
  entryId: string;

  @Output()
  attachmentUploaded = new EventEmitter<Attachment>();

  fileToUploadName: string;
  fileToUpload: File;

  uploadProgress: number = 0;

  constructor(private attachmentService: AttachmentService) {
  }

  handleFileInput(event) {
    this.fileToUpload = event.target.files.item(0);
  }

  onSubmit(attachmentForm: NgForm) {
    this.attachmentService.uploadAttachment(this.entryId, this.fileToUpload)
      .subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            this.uploadProgress = Math.round(event.loaded / event.total * 100);
            break;
          case HttpEventType.Response:
            setTimeout(() => {
              this.uploadProgress = 0;
              this.fileToUploadName = '';
              this.fileToUpload = null;
              attachmentForm.form.reset();
              this.attachmentUploaded.emit(event.body);
            }, 500);
        }
      });
  }
}
