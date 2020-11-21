import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'lks-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrls: ['footer.component.scss'],
})
export class FooterComponent {

  constructor() {
  }
}
