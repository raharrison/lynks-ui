import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {DomSanitizer, SafeUrl, Title} from "@angular/platform-browser";
import {HighlightJS} from "ngx-highlightjs";
import {Subscription} from "rxjs";
import {Attachment, AttachmentCategory, AttachmentType} from "@app/attachment/models";
import {AttachmentService} from "@app/attachment/services/attachment.service";

@Component({
  selector: 'lks-attachment-view',
  templateUrl: './attachment-view.component.html',
  styleUrls: ['./attachment-view.component.scss']
})
export class AttachmentViewComponent implements OnInit, OnDestroy {
  private static TEXT_EXT_OVERRIDES = {
    "bat": "bash",
    "cpp": "cpp",
    "cs": "cs",
    "css": "css",
    "gradle": "gradle",
    "handlebars": "handlebars",
    "html": "xml",
    "js": "javascript",
    "json": "json",
    "kt": "kotlin",
    "log": "plaintext",
    "py": "python",
    "sh": "bash",
    "sql": "sql",
    "ts": "typescript",
    "txt": "plaintext",
    "xml": "xml"
  };

  loadingAttachment = true;
  loadingAttachmentData = false;

  entryId: string;
  attachmentId: string;
  attachment: Attachment;
  attachmentUrl: SafeUrl;

  attachmentCategory: AttachmentCategory;
  attachmentMimeType: string;
  attachmentLanguageClass: string;
  rawText: string;

  private highlightSubscription: Subscription = new Subscription();

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              private sanitizer: DomSanitizer,
              private hljs: HighlightJS,
              private attachmentService: AttachmentService) {
  }

  ngOnInit(): void {
    this.entryId = this.route.snapshot.paramMap.get("id");
    this.attachmentId = this.route.snapshot.paramMap.get("attachmentId");
    const unsafeUrl = this.attachmentService.createDownloadLink(this.entryId, this.attachmentId);
    this.attachmentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);

    this.attachmentService.getAttachment(this.entryId, this.attachmentId).subscribe(resp => {
      this.attachment = resp.body;
      this.attachmentMimeType = resp.headers.get("X-Resource-Mime-Type")?.toLowerCase();
      this.attachmentCategory = this.deriveAttachmentCategory(this.attachment.type, this.attachmentMimeType,
        this.attachment.extension.toLowerCase());
      this.loadingAttachment = false;
      this.titleService.setTitle(this.attachment.name + " - Lynks");
      this.postProcessAttachment();
    });
  }

  private deriveAttachmentCategory(type: AttachmentType, mime: string, extension: string): AttachmentCategory {
    if (!mime) {
      return AttachmentCategory.UNKNOWN;
    }
    if (type == AttachmentType.READABLE_DOC || extension == "html") {
      return AttachmentCategory.PAGE;
    }
    if (extension == "ttml") {
      return AttachmentCategory.SUBTITLE;
    }
    if (extension in AttachmentViewComponent.TEXT_EXT_OVERRIDES) {
      this.attachmentLanguageClass = `language-${AttachmentViewComponent.TEXT_EXT_OVERRIDES[extension]}`;
      return AttachmentCategory.TEXT;
    } else if (mime.startsWith("text/")) return AttachmentCategory.TEXT;
    else if (mime.startsWith("image/")) return AttachmentCategory.IMAGE;
    else if (mime.startsWith("audio/")) return AttachmentCategory.AUDIO;
    else if (mime.startsWith("video/")) return AttachmentCategory.VIDEO;
    else if (mime.startsWith("application/pdf")) return AttachmentCategory.PDF;
    // overrides
    else if (mime.startsWith("application/mp4")) return AttachmentCategory.VIDEO;
    return AttachmentCategory.UNKNOWN;
  }

  private postProcessAttachment() {
    if (this.attachmentCategory == AttachmentCategory.TEXT ||
      this.attachmentCategory == AttachmentCategory.PAGE ||
      this.attachmentCategory == AttachmentCategory.SUBTITLE) {
      this.loadingAttachmentData = true;
      this.attachmentService.downloadAttachment(this.entryId, this.attachmentId).subscribe(data => {
        const blob = data as Blob;
        new Response(blob).text().then(value => {
          this.rawText = value;
          this.loadingAttachmentData = false;
          setTimeout(_ =>
            document.querySelectorAll("pre code").forEach(item => {
              const sub = this.hljs.highlightElement(item as HTMLElement).subscribe();
              this.highlightSubscription.add(sub);
            }), 1);
        });
      });
    }
  }

  parseObj(str: string) {
    if (str) {
      return JSON.parse(str);
    }
  }

  onDownloadClick(attachment: Attachment) {
    const url = this.attachmentService.createDownloadLink(this.entryId, attachment.id);
    window.open(url);
  }

  ngOnDestroy(): void {
    this.highlightSubscription.unsubscribe();
  }

}
