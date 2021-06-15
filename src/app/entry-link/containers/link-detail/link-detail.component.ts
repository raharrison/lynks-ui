import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {EntryType, Link, SlimLink} from "@shared/models";
import {EntryResource, EntryService} from "@app/entry/services/entry.service";
import {LinkService} from "@app/entry/services/link.service";
import {ToastrService} from "ngx-toastr";

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

  private entryResource: EntryResource<SlimLink, Link>;

  constructor(private route: ActivatedRoute,
              private toastrService: ToastrService,
              private entryService: EntryService,
              private linkService: LinkService) {
    this.entryResource = entryService.resolveService(EntryType.LINK);
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
      this.entryResource.getVersion(this.id, this.version).subscribe((data) => {
        this.link = data;
        this.loading = false;
      });
    } else {
      this.entryResource.get(this.id).subscribe((data) => {
        this.link = data;
        this.loading = false;
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
