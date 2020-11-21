import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
    selector: 'lks-dashboard-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dashboard-card.component.html',
    styleUrls: ['dashboard-card.component.scss'],
})
export class DashboardCardComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}
