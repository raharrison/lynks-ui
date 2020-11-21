import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit,} from '@angular/core';
import {sideNavItems, sideNavSections} from '@app/navigation/data';
import {NavigationService} from '@app/navigation/services';
import {Subscription} from 'rxjs';

@Component({
    selector: 'lks-layout-dashboard',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './layout-dashboard.component.html',
    styleUrls: ['layout-dashboard.component.scss'],
})
export class LayoutDashboardComponent implements OnInit, OnDestroy {
    @HostBinding('class.lks-sidenav-toggled') sideNavHidden = false;
    subscription: Subscription = new Subscription();
    sideNavItems = sideNavItems;
    sideNavSections = sideNavSections;

    constructor(
        public navigationService: NavigationService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.subscription.add(
            this.navigationService.sideNavVisible$().subscribe(isVisible => {
                this.sideNavHidden = !isVisible;
                this.changeDetectorRef.markForCheck();
            })
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
