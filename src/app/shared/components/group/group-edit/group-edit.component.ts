import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Grouping} from "@shared/models";
import {TagService} from "@shared/services/tag.service";
import {CollectionService} from "@shared/services/collection.service";
import {Observable} from "rxjs";

@Component({
  selector: 'lks-group-editor',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent implements OnInit {

  groups$: Observable<Grouping<any>[]>;

  @Input()
  maxSelected = 25;

  @Input()
  type: "tag" | "collection" | undefined;

  @Input()
  selected: Grouping<any>[] = [];

  @Output()
  selectedChange = new EventEmitter<Grouping<any>[]>();

  constructor(private tagService: TagService, private collectionService: CollectionService) {
  }

  ngOnInit(): void {
    if (this.type == "tag") {
      this.groups$ = this.tagService.$tags;
    } else {
      this.groups$ = this.collectionService.$collectionsFlattened;
    }
  }

  onGroupChange() {
    this.selectedChange.emit(this.selected);
  }

}
