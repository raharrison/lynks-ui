import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {LinkService} from "../../../../services/link.service";
import {Link} from "../../../../model/link.model";

@Component({
  selector: 'app-link-detail',
  templateUrl: './link-detail.component.html',
  styleUrls: ['./link-detail.component.css']
})
export class LinkDetailComponent implements OnInit {

  id;
  link: Link;
  loading = true;
  isContentCollapsed = true;

  constructor(private route: ActivatedRoute,
              private linkService: LinkService) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.linkService.getLink(this.id).subscribe((data) => {
      this.link = data;
      this.loading = false;
    });
  }

}
