import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AuthService} from '@shared/services/auth.service';
import {RouteProviderService} from "@shared/services/route-provider.service";
import {EntryType} from "@shared/models";

@Component({
  selector: 'lks-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './side-nav.component.html',
  styleUrls: ['side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy {

  EntryType = EntryType;
  linkPath: string;

  private routeEventSubscription: Subscription;

  constructor(public authService: AuthService,
              private router: Router,
              private changeDetectorRef: ChangeDetectorRef,
              public routeProvider: RouteProviderService) {
    this.linkPath = routeProvider.entryDefsByType[EntryType.LINK].path;
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
