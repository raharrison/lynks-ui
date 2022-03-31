import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationService} from '@app/navigation/services';
import {EntryFilterService} from "@shared/services";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
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
    this.router.navigate(["/entries"], {queryParams: {"q": this.searchTerms}});
  }

  ngOnDestroy(): void {
    if (this.entryFilterSubscription != null) {
      this.entryFilterSubscription.unsubscribe();
    }
  }

}
