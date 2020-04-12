import {Component, Input, OnInit} from '@angular/core';
import {SlimLink} from "../../../../model/link.model";

@Component({
  selector: 'app-link-list-item',
  templateUrl: './link-list-item.component.html',
  styleUrls: ['./link-list-item.component.css']
})
export class LinkListItemComponent implements OnInit {

  @Input()
  link: SlimLink;

  constructor() {
  }

  ngOnInit(): void {
  }

}
