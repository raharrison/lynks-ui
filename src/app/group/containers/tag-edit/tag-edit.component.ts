import {Component, OnInit} from '@angular/core';
import {TagService} from "@shared/services/tag.service";
import {Observable} from "rxjs";
import {NewTag, Tag} from "@shared/models";
import {NgForm} from "@angular/forms";

@Component({
  selector: 'lks-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit {

  $tags: Observable<Tag[]>;

  newTagSaving = false;
  newTagName = "";

  constructor(public tagService: TagService) {
  }

  ngOnInit(): void {
    this.$tags = this.tagService.$tags;
  }

  onTagSave(tagForm: NgForm) {
    const newTag: NewTag = {
      name: this.newTagName
    }
    this.newTagSaving = true;
    this.tagService.createTag(newTag).subscribe(() => {
      tagForm.form.reset();
      this.newTagSaving = false;
      this.tagService.refreshTags();
    });
  }

}
