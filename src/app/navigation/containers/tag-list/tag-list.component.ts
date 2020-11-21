import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {TagService} from "@shared/services/tag.service";
import {Tag} from "@shared/models";

@Component({
  selector: 'lks-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit {

  tags: Tag[];
  expanded: boolean = false;

  constructor(private tagService: TagService, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.tagService.getTags().subscribe(value => {
        this.tags = value;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

}
