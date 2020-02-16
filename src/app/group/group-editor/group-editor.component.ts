import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TagService} from "../../service/tag.service";
import {CollectionService} from "../../service/collection.service";
import {Grouping} from "../../model/group.model";

@Component({
  selector: 'app-group-editor',
  templateUrl: './group-editor.component.html',
  styleUrls: ['./group-editor.component.css']
})
export class GroupEditorComponent implements OnInit {

  @Input()
  type: "tag" | "collection";

  allGroups: Grouping<any>[] = [];

  @Input()
  selected: Grouping<any>[] = [];

  @Output()
  selectedChange = new EventEmitter<Grouping<any>[]>();

  constructor(private tagService: TagService,
              private collectionService: CollectionService) { }

  ngOnInit(): void {
    if(this.type == "tag") {
      this.tagService.getTags().subscribe(tags => this.allGroups = tags);
    } else {
      this.collectionService.getCollections().subscribe(cols => this.allGroups = cols);
    }
  }

  onGroupChange() {
    this.selectedChange.emit(this.selected);
  }

}
