import {Component, OnDestroy, OnInit} from '@angular/core';
import {TagService} from "@shared/services/tag.service";
import {Tag} from "@shared/models";
import {DisplayGroup} from "@app/group/model/display-group.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DeleteConfirmModalComponent} from "@shared/components";
import {Subscription} from "rxjs";

@Component({
  selector: 'lks-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit, OnDestroy {

  private tagSubscription: Subscription;
  private rootId: string = "1";

  tagTree: DisplayGroup[] = [];
  editingTag: Tag = null;
  newTagSaving = false;
  newTagName = "";

  constructor(private modalService: NgbModal,
              private tagService: TagService) {
  }

  ngOnInit(): void {
    this.tagSubscription = this.tagService.$tags.subscribe(tags => {
      this.tagTree = [{
        id: this.rootId,
        name: "Tags",
        children: TagEditComponent.buildTagModel(tags),
        isExpanded: true
      }];
    });
  }

  private static buildTagModel(tags: Tag[]): DisplayGroup[] {
    return tags.map(tag => {
      return {
        id: tag.id,
        name: tag.name,
        children: [],
        isExpanded: true
      }
    })
  }

  onTagSave() {
    this.newTagSaving = true;
    const handler = {
      next: () => {
        this.newTagSaving = false;
        this.editingTag = null;
        this.tagService.refreshTags();
        this.modalService.dismissAll();
      },
      error: () => {
        this.newTagSaving = false;
      }
    }
    if (this.editingTag == null) {
      this.tagService.createTag({
        name: this.newTagName
      }).subscribe(handler);
    } else {
      this.tagService.updateTag({
        id: this.editingTag.id,
        name: this.newTagName
      }).subscribe(handler);
    }
  }

  onTagDelete() {
    if (this.editingTag != null) {
      const modalRef = this.modalService.open(DeleteConfirmModalComponent);
      modalRef.componentInstance.data = this.editingTag;
      modalRef.componentInstance.type = "tag";

      modalRef.result.then(closeData => {
        if (closeData) {
          this.deleteTag(this.editingTag.id);
        }
      }, () => {
      });
    }
  }

  private deleteTag(id: string) {
    this.tagService.deleteTag(id).subscribe({
      next: () => {
        this.newTagSaving = false;
        this.editingTag = null;
        this.tagService.refreshTags();
      },
      error: () => {
        this.newTagSaving = false;
      }
    });
  }

  setEditingTag(tag) {
    if (tag.id != this.rootId) {
      this.editingTag = tag;
    } else {
      this.editingTag = null;
    }
  }

  openEditDialog(editDialog) {
    if (this.editingTag != null) {
      this.newTagName = this.editingTag.name;
    } else {
      this.newTagName = "";
    }
    this.modalService.open(editDialog, {size: "lg"});
  }

  ngOnDestroy(): void {
    if (this.tagSubscription != null) {
      this.tagSubscription.unsubscribe();
    }
  }
}
