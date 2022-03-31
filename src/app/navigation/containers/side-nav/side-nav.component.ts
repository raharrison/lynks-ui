import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '@app/shared/services';
import {SideNavItems, SideNavSection} from '@app/navigation/models';
import {entryLinkItems} from "@app/navigation/data/entry-list-links.data";
import {NavigationEnd, Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'lks-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './side-nav.component.html',
  styleUrls: ['side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy {

  @Input() sideNavSections!: SideNavSection[];
  @Input() sideNavItems!: SideNavItems;

  entryLinkItems = entryLinkItems;

  private routeEventSubscription: Subscription;

  constructor(public userService: UserService,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.routeEventSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  isRouteActive(path: string): boolean {
    return this.router.url == path;
  }

  ngOnDestroy(): void {
    if (this.routeEventSubscription != null) {
      this.routeEventSubscription.unsubscribe();
    }
  }


}
