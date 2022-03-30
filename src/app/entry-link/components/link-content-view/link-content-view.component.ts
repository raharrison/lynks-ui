import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Link} from "@shared/models";
import {Attachment, AttachmentType} from "@app/attachment/models";
import {AttachmentService} from "@app/attachment/services/attachment.service";

@Component({
  selector: 'lks-link-content-view',
  templateUrl: './link-content-view.component.html',
  styleUrls: ['./link-content-view.component.scss']
})
export class LinkContentViewComponent implements OnChanges {

  @Input()
  link: Link;

  @Input()
  attachments: Attachment[] = [];

  readableContentAvailable: boolean = false;
  readableContent: string = null;
  readableContentLoading: boolean = false;

  constructor(private attachmentService: AttachmentService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.readableContentLoading = false;
    this.readableContentAvailable = !!this.attachments.find(a => a.type == AttachmentType.READABLE_DOC);
  }

  loadReadableAttachment(collapsed) {
    if (collapsed) {
      this.readableContentLoading = false;
      this.readableContent = null;
    } else {
      const readableAttachment = this.attachments.find(a => a.type == AttachmentType.READABLE_DOC);
      if (readableAttachment) {
        this.readableContentAvailable = true;
        this.readableContentLoading = true;
        this.attachmentService.downloadAttachment(this.link.id, readableAttachment.id).subscribe({
          next: data => {
            const blob = data as Blob;
            new Response(blob).text().then(value => {
              this.readableContentLoading = false;
              this.readableContent = value;
            });
          },
          error: () => {
            this.readableContentLoading = false;
          }
        });
      }
    }
  }

}
