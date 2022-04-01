import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Collection} from "@shared/models";
import {Subscription} from "rxjs";
import {CollectionService} from "@shared/services/collection.service";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-collection-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss']
})
export class CollectionListComponent implements OnInit, OnDestroy {

  collections: Collection[];
  expanded: boolean = false;

  private collectionSubscription: Subscription;

  constructor(private collectionService: CollectionService,
              private changeDetectorRef: ChangeDetectorRef,
              public routeProvider: RouteProviderService) {
  }

  ngOnInit(): void {
    this.collectionSubscription = this.collectionService.$collectionsFlattened.subscribe(value => {
        this.collections = value;
        this.changeDetectorRef.markForCheck();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.collectionSubscription != null) {
      this.collectionSubscription.unsubscribe();
    }
  }

}
