import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NavigationService} from '@app/navigation/services';

@Component({
  selector: 'lks-top-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './top-nav.component.html',
  styleUrls: ['top-nav.component.scss'],
})
export class TopNavComponent {

  constructor(private navigationService: NavigationService) {
  }

  toggleSideNav() {
    this.navigationService.toggleSideNav();
  }
}
