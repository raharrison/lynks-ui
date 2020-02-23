import {Component, Input, OnInit} from '@angular/core';
import {Link} from "../../../../model/link.model";

@Component({
  selector: 'app-link-list-item',
  templateUrl: './link-list-item.component.html',
  styleUrls: ['./link-list-item.component.css']
})
export class LinkListItemComponent implements OnInit {

  @Input()
  link: Link;

  constructor() { }

  ngOnInit(): void {
  }

}
