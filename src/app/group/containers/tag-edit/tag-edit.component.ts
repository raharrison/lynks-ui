import {Component, OnInit} from '@angular/core';
import {TagService} from "@shared/services/tag.service";
import {Observable} from "rxjs";
import {Tag} from "@shared/models";

@Component({
  selector: 'lks-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit {

  $tags: Observable<[Tag]>;

  constructor(private tagService: TagService) {
  }

  ngOnInit(): void {
    this.retrieveTags();
  }

  retrieveTags() {
    this.$tags = this.tagService.getTags()
  }

}
