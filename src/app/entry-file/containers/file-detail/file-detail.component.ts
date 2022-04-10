import {Component, OnInit} from '@angular/core';
import {File} from "@shared/models";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {ActivatedRoute} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {FileService} from "@app/entry/services/file.service";
import {Attachment} from "@app/attachment/models";

@Component({
  selector: 'lks-file-detail',
  templateUrl: './file-detail.component.html',
  styleUrls: ['./file-detail.component.scss']
})
export class FileDetailComponent implements OnInit {

  id: string;
  file: File;
  version: string;
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  mainAttachmentId: string;

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              private fileService: FileService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get("id");
      this.version = params.get("version");
      this.retrieveFile();
    });
  }

  private retrieveFile() {
    const observer = {
      next: data => {
        this.file = data;
        this.loadingStatus = LoadingStatus.LOADED;
        this.titleService.setTitle(data.title + " - Lynks");
      },
      error: _ => {
        this.loadingStatus = LoadingStatus.ERROR;
      }
    };
    if (this.version) {
      this.fileService.getVersion(this.id, this.version).subscribe(observer);
    } else {
      this.fileService.get(this.id).subscribe(observer);
    }
  }

  onAttachmentsLoaded(attachments: Attachment[]) {
    if (attachments.length > 0) {
      this.mainAttachmentId = attachments[0].id;
    }
  }
}
