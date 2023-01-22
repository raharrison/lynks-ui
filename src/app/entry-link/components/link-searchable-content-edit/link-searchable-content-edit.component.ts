import {Component, Input} from '@angular/core';
import {LinkService} from "@app/entry/services/link.service";

@Component({
  selector: 'lks-link-searchable-content-edit',
  templateUrl: './link-searchable-content-edit.component.html',
  styleUrls: ['./link-searchable-content-edit.component.scss']
})
export class LinkSearchableContentEditComponent {

  @Input()
  entryId: string;

  @Input()
  content: string;

  editMode: boolean = false;
  contentInput: string;

  constructor(private linkService: LinkService) {
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.editMode = true;
    this.contentInput = this.content;
  }

  onSaveClick(event: Event) {
    event.stopPropagation();
    this.linkService.updateSearchableContent(this.entryId, this.contentInput)
      .subscribe(res => {
        this.editMode = false;
        this.content = res.content;
        this.contentInput = null;
      });
  }

  onEditCancelClick(event: Event) {
    event.stopPropagation();
    this.editMode = false;
    this.contentInput = null;
  }

}
