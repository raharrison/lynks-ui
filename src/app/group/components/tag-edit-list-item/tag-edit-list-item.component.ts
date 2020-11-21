import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NewTag, Tag} from "@shared/models";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DeleteConfirmModalComponent} from "@shared/components";
import {TagService} from "@shared/services/tag.service";

@Component({
  selector: 'tr[lks-tag-edit-list-item]',
  templateUrl: './tag-edit-list-item.component.html',
  styleUrls: ['./tag-edit-list-item.component.scss']
})
export class TagEditListItemComponent implements OnInit {

  @Input()
  tag: Tag;

  @Output()
  tagModified = new EventEmitter<Tag>();

  editMode = false;
  tagNameInput: string;

  constructor(private tagService: TagService,
              private modalService: NgbModal) {
  }

  ngOnInit() {
  }

  openDeleteModal(event: Event, tag: Tag) {
    event.stopPropagation();
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.data = tag;
    modalRef.componentInstance.type = "tag";

    modalRef.result.then(closeData => {
      if (closeData) {
        this.deleteTag(closeData);
      }
    }, () => {
    });
  }

  private deleteTag(tag: Tag) {
    this.tagService.deleteTag(tag.id)
      .subscribe(_ => {
        this.tagModified.emit(tag);
      });
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.editMode = true;
    this.tagNameInput = this.tag.name;
  }

  onSaveClick(event: Event) {
    event.stopPropagation();
    const updatedTag: NewTag = {
      id: this.tag.id,
      name: this.tagNameInput
    };
    this.tagService.updateTag(updatedTag)
      .subscribe(res => {
        this.tag = res;
        this.editMode = false;
        this.tag.name = this.tagNameInput;
        this.tagNameInput = null;
      });
  }

  onEditCancelClick(event: Event) {
    event.stopPropagation();
    this.editMode = false;
    this.tagNameInput = null;
  }

}
