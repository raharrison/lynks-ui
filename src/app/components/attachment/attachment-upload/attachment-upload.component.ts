import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgForm} from "@angular/forms";
import {AttachmentService} from "../../../services/attachment.service";
import {Attachment} from "../../../model/attachment.model";

@Component({
  selector: 'app-attachment-upload',
  templateUrl: './attachment-upload.component.html',
  styleUrls: ['./attachment-upload.component.css']
})
export class AttachmentUploadComponent implements OnInit {

  @Input()
  entryId: string;

  @Output()
  attachmentUploaded = new EventEmitter<Attachment>();

  fileToUploadName: string;
  fileToUpload: File;

  saving = false;

  model: any = {};

  constructor(private attachmentService: AttachmentService) { }

  ngOnInit(): void {
  }

  handleFileInput(event) {
    this.fileToUpload = event.target.files.item(0);
  }

  onSubmit(attachmentForm: NgForm) {
    this.saving = true;
    this.attachmentService.uploadAttachment(this.entryId, this.fileToUpload)
        .subscribe((response) => {
          this.saving = false;
          this.fileToUploadName = '';
          this.fileToUpload = null;
          attachmentForm.form.reset();
          this.attachmentUploaded.emit(response);
        })
  }
}
