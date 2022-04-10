import {Component, EventEmitter, Input, Output} from '@angular/core';
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

  // whether to include upload button or rely on external component to submit
  @Input()
  standalone: boolean = true;

  @Output()
  attachmentUploaded = new EventEmitter<Attachment>();

  @Output()
  fileChanged = new EventEmitter<string>();

  // handle to the upload component filename
  fileToUploadName: string;
  fileToUpload: File;

  uploadProgress: number = 0;

  constructor(private attachmentService: AttachmentService) {
  }

  handleFileInput(event) {
    this.fileToUpload = event.target.files.item(0);
    this.fileChanged.next(this.fileToUpload?.name);
  }

  onSubmit() {
    this.attachmentService.uploadAttachment(this.entryId, this.fileToUpload)
      .subscribe({
        next: (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              this.uploadProgress = Math.round(event.loaded / event.total * 100);
              break;
            case HttpEventType.Response:
              setTimeout(() => {
                this.uploadProgress = 0;
                this.fileToUpload = null;
                // blank out the file component after upload
                this.fileToUploadName = '';
                this.attachmentUploaded.emit(event.body);
              }, 500);
          }
        },
        error: err => {
          this.uploadProgress = 0;
          this.attachmentUploaded.error(err);
        }
      });
  }
}
