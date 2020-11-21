import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {SideNavItem} from '@app/navigation/models';

@Component({
    selector: 'lks-side-nav-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './side-nav-item.component.html',
    styleUrls: ['side-nav-item.component.scss'],
})
export class SideNavItemComponent implements OnInit {
    @Input() sideNavItem!: SideNavItem;
    @Input() isActive!: boolean;

    expanded = false;

    constructor() {
    }

    ngOnInit() {
    }
}
