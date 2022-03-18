import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationService} from '@app/navigation/services';
import {EntryFilterService} from "@shared/services";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {EntryType} from "@shared/models";
import {entryLinkItems} from "@app/navigation/data/entry-list-links.data";

@Component({
  selector: 'lks-top-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav.component.html',
  styleUrls: ['top-nav.component.scss'],
})
export class TopNavComponent implements OnInit, OnDestroy {

  private entryFilterSubscription: Subscription;
  searchTerms: string = "";

  entryLinkItems = entryLinkItems;

  constructor(private router: Router,
              private changeDetectorRef: ChangeDetectorRef,
              private navigationService: NavigationService,
              private entryFilterService: EntryFilterService) {
  }

  ngOnInit(): void {
    this.entryFilterSubscription = this.entryFilterService.$entryFilter
      .subscribe(filter => {
        this.searchTerms = filter.searchTerms;
        this.changeDetectorRef.markForCheck();
      });
  }

  toggleSideNav() {
    this.navigationService.toggleSideNav();
  }

  onSearchSubmit() {
    const page = "/entries";
    this.entryFilterService.setSearch(this.searchTerms, this.router.url === page);
    if (this.router.url !== page) {
      this.router.navigate(["/entries"]);
    }
  }

  navToEntryList(page: string, type: EntryType) {
    if (this.router.url === page) {
      this.entryFilterService.resetToType(type);
    } else {
      this.router.navigate([page]);
    }
  }

  ngOnDestroy(): void {
    if (this.entryFilterSubscription != null) {
      this.entryFilterSubscription.unsubscribe();
    }
  }


}
