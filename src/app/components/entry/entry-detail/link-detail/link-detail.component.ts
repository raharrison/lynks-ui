import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Link} from "../../../../model/link.model";
import {EntryResource, EntryService} from "../../../../services/entry.service";
import {EntryType} from "../../../../model/entry.model";

@Component({
  selector: 'app-link-detail',
  templateUrl: './link-detail.component.html',
  styleUrls: ['./link-detail.component.css']
})
export class LinkDetailComponent implements OnInit {

  id;
  link: Link;
  version: string;
  loading = true;
  isContentCollapsed = true;

  private entryResource: EntryResource<Link>;

  constructor(private route: ActivatedRoute,
              private entryService: EntryService) {
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

  isLinkRead() {
    return this.link?.props.attributes?.read == true;
  }

}
