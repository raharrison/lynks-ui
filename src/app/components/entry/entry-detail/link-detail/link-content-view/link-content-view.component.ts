import {Component, Input, OnInit} from '@angular/core';
import {Link} from "../../../../../model/link.model";

@Component({
  selector: 'app-link-content-view',
  templateUrl: './link-content-view.component.html',
  styleUrls: ['./link-content-view.component.css']
})
export class LinkContentViewComponent implements OnInit {

  @Input()
  link: Link;

  isContentCollapsed = true;
  isEmbedFrameCollapsed = true;

  constructor() {
  }

  ngOnInit(): void {
  }

}
