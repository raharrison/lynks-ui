import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {Grouping} from "@shared/models";
import {TagService} from "@shared/services/tag.service";
import {CollectionService} from "@shared/services/collection.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'lks-group-editor',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent implements OnInit, OnChanges, OnDestroy {

  groups: Grouping<any>[] = [];

  @Input()
  maxSelected = 25;

  @Input()
  type: "tag" | "collection" | undefined;

  @Input()
  selected: Grouping<any>[] = [];

  @Input()
  selectedIds: string[];

  @Input()
  disabled: boolean = false;

  @Output()
  selectedChange = new EventEmitter<Grouping<any>[]>();

  private groupSubscription: Subscription;

  constructor(private tagService: TagService, private collectionService: CollectionService) {
  }

  ngOnInit(): void {
    if (this.type == "tag") {
      this.tagService.$tags.subscribe(groups => {
        this.groups = groups;
        this.setSelectedFromIds();
      });
    } else {
      this.collectionService.$collectionsFlattened.subscribe(groups => {
        this.groups = groups;
        this.setSelectedFromIds();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ("selectedIds" in changes) {
      this.setSelectedFromIds();
    }
  }

  private setSelectedFromIds() {
    if (this.selectedIds) {
      this.selected = [];
      for (let group of this.groups) {
        if (this.selectedIds.includes(group.id)) {
          this.selected.push(group);
        }
      }
    }
  }

  onGroupChange() {
    this.selectedChange.emit(this.selected);
  }

  ngOnDestroy(): void {
    if (this.groupSubscription != null) {
      this.groupSubscription.unsubscribe();
    }
  }

}
