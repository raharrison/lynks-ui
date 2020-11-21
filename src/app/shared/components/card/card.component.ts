import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
    selector: 'lks-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './card.component.html',
    styleUrls: ['card.component.scss'],
})
export class CardComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}
