import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'lks-card',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './card.component.html',
    styleUrls: ['card.component.scss'],
})
export class CardComponent implements OnInit {

    @Input()
    isCollapsed = true;

    @Input()
    title: string;

    @Input()
    headerStyles: string = "";

    constructor() {
    }

    ngOnInit() {
    }
}
