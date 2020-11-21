import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Grouping} from "@shared/models";
import {TagService} from "@shared/services/tag.service";
import {CollectionService} from "@shared/services/collection.service";

@Component({
  selector: 'lks-group-editor',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent implements OnInit {

  @Input()
  type: "tag" | "collection" | undefined;

  allGroups: Grouping<any>[] = [];

  @Input()
  selected: Grouping<any>[] = [];

  @Output()
  selectedChange = new EventEmitter<Grouping<any>[]>();

  constructor(private tagService: TagService,
              private collectionService: CollectionService) {
  }

  ngOnInit(): void {
    if (this.type == "tag") {
      this.tagService.getTags().subscribe(tags => this.allGroups = tags);
    } else {
      this.collectionService.getCollections().subscribe(cols => this.allGroups = cols);
    }
  }

  onGroupChange() {
    this.selectedChange.emit(this.selected);
  }

}
