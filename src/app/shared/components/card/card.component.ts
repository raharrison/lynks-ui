import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'lks-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrls: ['card.component.scss'],
})
export class CardComponent {

  @Input()
  isCollapsed = true;

  @Input()
  headerStyles: string = "";

  @Input()
  preserveElements: boolean = true;

  @Output()
  onCollapseChange = new EventEmitter<boolean>();

  constructor() {
  }

  emitCollapseChange() {
    this.onCollapseChange.emit(this.isCollapsed);
  }
}
