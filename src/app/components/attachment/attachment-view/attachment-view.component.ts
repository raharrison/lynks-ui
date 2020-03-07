import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AttachmentService} from "../../../services/attachment.service";
import {Attachment, AttachmentCategory} from "../../../model/attachment.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {HighlightJS} from "ngx-highlightjs";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-attachment-view',
  templateUrl: './attachment-view.component.html',
  styleUrls: ['./attachment-view.component.css']
})
export class AttachmentViewComponent implements OnInit, OnDestroy {
  private static TEXT_EXT_OVERRIDES = ["bat", "cpp", "gradle", "handlebars", "js", "json", "kt", "sh", "sql", "ts", "xml"];

  loadingAttachment = false;

  entryId: string;
  attachmentId: string;
  attachment: Attachment;
  attachmentUrl: SafeUrl;

  attachmentCategory: AttachmentCategory;
  attachmentMimeType: string;
  rawText: string;

  private subscriptions: Subscription[] = [];

  constructor(private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private hljs: HighlightJS,
              private attachmentService: AttachmentService) { }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get("id");
    this.attachmentId = this.route.snapshot.paramMap.get("attachmentId");
    const unsafeUrl = "http://localhost:8080" + this.attachmentService.createDownloadLink(this.entryId, this.attachmentId);
    this.attachmentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);

    this.attachmentService.getAttachment(this.entryId, this.attachmentId).subscribe(resp => {
      this.attachment = resp.body;
      this.attachmentMimeType = resp.headers.get("X-Resource-Mime-Type")?.toLowerCase();
      this.attachmentCategory = AttachmentViewComponent.findCategory(this.attachmentMimeType, this.attachment.extension);
      this.postProcessAttachment();
    });
  }

  private static findCategory(mime: string, extension: string): AttachmentCategory {
    if(!mime) {
      return AttachmentCategory.UNKNOWN;
    }
    if(mime.startsWith("text/")) return AttachmentCategory.TEXT;
    else if(mime.startsWith("image/")) return AttachmentCategory.IMAGE;
    else if(mime.startsWith("audio/")) return AttachmentCategory.AUDIO;
    else if(mime.startsWith("video/")) return AttachmentCategory.VIDEO;
    else if(mime.startsWith("application/pdf")) return AttachmentCategory.PDF;
    // overrides
    else if(mime.startsWith("application/mp4")) return AttachmentCategory.VIDEO;
    else if(AttachmentViewComponent.TEXT_EXT_OVERRIDES.includes(extension)) return AttachmentCategory.TEXT;
    return AttachmentCategory.UNKNOWN;
  }

  private postProcessAttachment() {
    if (this.attachmentCategory == AttachmentCategory.TEXT) {
      this.loadingAttachment = true;
      this.attachmentService.downloadAttachment(this.entryId, this.attachmentId).subscribe(data => {
        const blob = data as Blob;
        new Response(blob).text().then(value => {
          this.rawText = value;
          this.loadingAttachment = false;
          setTimeout(_ =>
              document.querySelectorAll("pre").forEach(item => {
                const sub = this.hljs.highlightBlock(item).subscribe();
                this.subscriptions.push(sub);
              }), 1);
        });
      });
    }
  }

  onDownloadClick(attachment: Attachment) {
    const url = this.attachmentService.createDownloadLink(this.entryId, attachment.id);
    window.open(url);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
