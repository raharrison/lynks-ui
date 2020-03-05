import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AttachmentService} from "../../../services/attachment.service";
import {Attachment} from "../../../model/attachment.model";

@Component({
  selector: 'app-attachment-view',
  templateUrl: './attachment-view.component.html',
  styleUrls: ['./attachment-view.component.css']
})
export class AttachmentViewComponent implements OnInit {

  window = window;
  entryId: string;
  attachmentId: string;
  attachment: Attachment;
  type: string;
  url: string;

  rawData: string;

  constructor(private route: ActivatedRoute,
              private attachmentService: AttachmentService) { }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get("id");
    this.attachmentId = this.route.snapshot.paramMap.get("attachmentId");
    this.url = this.attachmentService.createDownloadLink(this.entryId, this.attachmentId);

    this.attachmentService.getAttachmentsForEntry(this.entryId).subscribe(values => {
      values.forEach(value => {
        if(value.id == this.attachmentId) {
          this.attachment = value;
          this.type = this.findType(this.attachment.extension);
          this.postProcess();
        }
      })
    });
  }

  private findType(extension: string): string {
    if(extension == "jpg") return "image";
    else if(["txt", "py"].includes(extension)) return "text";
    return "unknown";
  }

  private postProcess() {
    if(this.type == "text") {
      this.attachmentService.downloadAttachment(this.entryId, this.attachmentId).subscribe(data => {
        const blob = data as Blob;
        console.log(blob.type);
        new Response(blob).text().then(value => this.rawData = value);
      });
    }
  }

}
