import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {UserService} from '@app/shared/services';
import {SideNavItems, SideNavSection} from '@app/navigation/models';

@Component({
  selector: 'lks-side-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './side-nav.component.html',
  styleUrls: ['side-nav.component.scss'],
})
export class SideNavComponent {
  @Input() sideNavSections!: SideNavSection[];
  @Input() sideNavItems!: SideNavItems;

  constructor(public userService: UserService) {
  }
}
