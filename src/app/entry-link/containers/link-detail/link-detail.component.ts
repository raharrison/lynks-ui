import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Link} from "@shared/models";
import {LinkService} from "@app/entry/services/link.service";
import {ToastrService} from "ngx-toastr";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'lks-link-detail',
  templateUrl: './link-detail.component.html',
  styleUrls: ['./link-detail.component.scss']
})
export class LinkDetailComponent implements OnInit {

  id;
  link: Link;
  version: string;
  loading = true;

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

  retrieveLink() {
    if (this.version) {
      this.linkService.getVersion(this.id, this.version).subscribe((data) => {
        this.link = data;
        this.loading = false;
        this.titleService.setTitle(data.title + " - Lynks");
      });
    } else {
      this.linkService.get(this.id).subscribe((data) => {
        this.link = data;
        this.loading = false;
        this.titleService.setTitle(data.title + " - Lynks");
      });
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
