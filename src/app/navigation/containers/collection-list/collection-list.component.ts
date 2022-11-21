import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {Collection} from "@shared/models";
import {Subscription} from "rxjs";
import {CollectionService} from "@shared/services/collection.service";
import {RouteProviderService} from "@shared/services/route-provider.service";
import {EntryFilterService} from "@shared/services/entry-filter.service";
import {TreeComponent} from "@bugsplat/angular-tree-component";

@Component({
  selector: 'lks-collection-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})
export class CollectionListComponent implements OnInit, OnDestroy {

  @ViewChild('tree')
  treeComponent: TreeComponent;

  collections: Collection[];
  expanded: boolean = false;

  private collectionFilterChanges = [];
  private collectionSubscription: Subscription;
  private entryFilterSubscription: Subscription;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private router: Router,
              private collectionService: CollectionService,
              private entryFilterService: EntryFilterService,
              private routeProvider: RouteProviderService) {
  }

  ngOnInit(): void {
    this.collectionSubscription = this.collectionService.$collections.subscribe(value => {
        this.collections = value;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  onTreeLoaded() {
    if (this.entryFilterSubscription != null) {
      return;
    }
    this.entryFilterSubscription = this.entryFilterService.$entryFilter.subscribe(filter => {
      if (filter.collections.length === 0) {
        this.treeComponent.treeModel.setActiveNode(null, false);
        this.treeComponent.treeModel.setFocusedNode(null);
      } else {
        this.collectionFilterChanges = filter.collections;
        const nodes = filter.collections.map(t => this.treeComponent.treeModel.getNodeById(t));
        this.treeComponent.treeModel.setActiveNode(null, false);
        this.treeComponent.treeModel.setFocusedNode(null);
        nodes.forEach(node => this.treeComponent.treeModel.setActiveNode(node, true, true));
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  onCollectionSelected(collection) {
    // only change route if collection selected by user, not background filter change
    if (this.collectionFilterChanges.length === 0) {
      this.router.navigate([this.routeProvider.baseEntryPath], {queryParams: {collections: collection.id}});
    }
    this.collectionFilterChanges = this.collectionFilterChanges.filter(t => t !== collection.id);
  }

  ngOnDestroy(): void {
    if (this.collectionSubscription != null) {
      this.collectionSubscription.unsubscribe();
    }
    if (this.entryFilterSubscription != null) {
      this.entryFilterSubscription.unsubscribe();
    }
  }

}
