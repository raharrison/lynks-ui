import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'lks-dashboard-head',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './dashboard-head.component.html',
    styleUrls: ['dashboard-head.component.scss'],
})
export class DashboardHeadComponent implements OnInit {
    @Input() title!: string;

    constructor() {
    }

    ngOnInit() {
    }
}
