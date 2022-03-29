import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Link} from "@shared/models";
import {LinkService} from "@app/entry/services/link.service";
import {ToastrService} from "ngx-toastr";
import {Title} from "@angular/platform-browser";
import {Attachment} from "@app/attachment/models";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-link-detail',
  templateUrl: './link-detail.component.html',
  styleUrls: ['./link-detail.component.scss']
})
export class LinkDetailComponent implements OnInit {

  id: string;
  link: Link;
  version: string;
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  attachments: Attachment[] = [];

  constructor(private route: ActivatedRoute,
              private titleService: Title,
              private toastrService: ToastrService,
              private linkService: LinkService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.id = params.get("id");
      this.version = params.get("version");
      this.retrieveLink();
    });
  }

  private retrieveLink() {
    const observer = {
      next: data => {
        this.link = data;
        this.loadingStatus = LoadingStatus.LOADED;
        this.titleService.setTitle(data.title + " - Lynks");
      },
      error: _ => {
        this.loadingStatus = LoadingStatus.ERROR;
      }
    };
    if (this.version) {
      this.linkService.getVersion(this.id, this.version).subscribe(observer);
    } else {
      this.linkService.get(this.id).subscribe(observer);
    }
  }

  isLinkDead(): boolean {
    return this.link?.props.attributes?.dead == true;
  }

  launchLink() {
    this.linkService.launch(this.id);
  }

  copyToClipboard() {
    const el = document.createElement('textarea');
    el.value = this.link.url;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.toastrService.success("Copied to clipboard!")
  }

}
