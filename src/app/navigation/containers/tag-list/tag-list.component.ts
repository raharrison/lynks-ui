import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {TagService} from "@shared/services/tag.service";
import {Tag} from "@shared/models";
import {Subscription} from "rxjs";
import {RouteProviderService} from "@shared/services/route-provider.service";
import {EntryFilterService} from "@shared/services/entry-filter.service";
import {TreeComponent} from "@bugsplat/angular-tree-component";

@Component({
  selector: 'lks-tag-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, OnDestroy {

  @ViewChild('tree')
  treeComponent: TreeComponent;

  tags: Tag[];
  expanded: boolean = false;

  private tagFilterChanges = [];
  private tagSubscription: Subscription;
  private entryFilterSubscription: Subscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private router: Router,
              private tagService: TagService,
              private entryFilterService: EntryFilterService,
              private routeProvider: RouteProviderService) {
  }

  ngOnInit(): void {
    this.tagSubscription = this.tagService.$tags.subscribe(value => {
        this.tags = value;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  onTreeLoaded() {
    if (this.entryFilterSubscription != null) {
      return;
    }
    this.entryFilterSubscription = this.entryFilterService.$entryFilter.subscribe(filter => {
      if (filter.tags.length === 0) {
        this.treeComponent.treeModel.setActiveNode(null, false);
        this.treeComponent.treeModel.setFocusedNode(null);
      } else {
        this.tagFilterChanges = filter.tags;
        const nodes = filter.tags.map(t => this.treeComponent.treeModel.getNodeById(t));
        this.treeComponent.treeModel.setActiveNode(null, false);
        this.treeComponent.treeModel.setFocusedNode(null);
        nodes.forEach(node => this.treeComponent.treeModel.setActiveNode(node, true, true));
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  onTagSelected(tag) {
    // only change route if tag selected by user, not background filter change
    if (this.tagFilterChanges.length === 0) {
      this.router.navigate([this.routeProvider.baseEntryPath], {queryParams: {tags: tag.id}});
    }
    this.tagFilterChanges = this.tagFilterChanges.filter(t => t !== tag.id);
  }

  ngOnDestroy(): void {
    if (this.tagSubscription != null) {
      this.tagSubscription.unsubscribe();
    }
    if (this.entryFilterSubscription != null) {
      this.entryFilterSubscription.unsubscribe();
    }
  }

}
