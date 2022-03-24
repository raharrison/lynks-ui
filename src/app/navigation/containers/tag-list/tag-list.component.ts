import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {TagService} from "@shared/services/tag.service";
import {Tag} from "@shared/models";
import {Subscription} from "rxjs";
import {EntryFilterService} from "@shared/services";

@Component({
  selector: 'lks-tag-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, OnDestroy {

  tags: Tag[];
  expanded: boolean = false;

  private tagSubscription: Subscription;

  constructor(private tagService: TagService,
              private changeDetectorRef: ChangeDetectorRef,
              public entryFilterService: EntryFilterService) {
  }

  ngOnInit(): void {
    this.tagSubscription = this.tagService.$tags.subscribe(value => {
        this.tags = value;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.tagSubscription != null) {
      this.tagSubscription.unsubscribe();
    }
  }

}
