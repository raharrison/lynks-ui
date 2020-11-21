import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
    selector: 'lks-layout-auth',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './layout-auth.component.html',
    styleUrls: ['layout-auth.component.scss'],
})
export class LayoutAuthComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}
