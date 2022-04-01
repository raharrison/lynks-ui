import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {NavigationService} from '@app/navigation/services';
import {EntryFilterService} from "@shared/services/entry-filter.service";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-top-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav.component.html',
  styleUrls: ['top-nav.component.scss'],
})
export class TopNavComponent implements OnInit, OnDestroy {

  private entryFilterSubscription: Subscription;
  searchTerms: string = "";

  constructor(private router: Router,
              private changeDetectorRef: ChangeDetectorRef,
              private navigationService: NavigationService,
              public routeProvider: RouteProviderService,
              private entryFilterService: EntryFilterService) {
  }

  ngOnInit(): void {
    this.entryFilterSubscription = this.entryFilterService.$entryFilter
      .subscribe(filter => {
        this.searchTerms = filter.q;
        this.changeDetectorRef.markForCheck();
      });
  }

  toggleSideNav() {
    this.navigationService.toggleSideNav();
  }

  onSearchSubmit() {
    const params = this.entryFilterService.setSearch(this.searchTerms);
    this.router.navigate([this.routeProvider.baseEntryPath], {queryParams: params});
  }

  ngOnDestroy(): void {
    if (this.entryFilterSubscription != null) {
      this.entryFilterSubscription.unsubscribe();
    }
  }

}
