import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {UserService} from '@app/shared/services/user.service';

@Component({
    selector: 'lks-top-nav-user',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './top-nav-user.component.html',
    styleUrls: ['top-nav-user.component.scss'],
})
export class TopNavUserComponent implements OnInit {
    constructor(public userService: UserService) {
    }

    ngOnInit() {
    }
}
