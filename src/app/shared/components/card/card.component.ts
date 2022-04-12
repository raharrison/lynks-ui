import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';

@Component({
  selector: 'lks-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrls: ['card.component.scss'],
})
export class CardComponent implements OnInit {

  // has the component been expanded (content loaded) at least once
  isInit: boolean = true;

  // attach to <ng-template> element in nested content
  @ContentChild(TemplateRef) detailRef;

  @Input()
  headerStyles: string = "";

  @Input()
  isCollapsed = true;

  // only init components in card when not collapsed
  @Input()
  lazy: boolean = false;

  @Output()
  onCollapseChange = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit() {
    if (this.lazy === true) {
      this.isInit = false;
    }
  }

  emitCollapseChange() {
    this.onCollapseChange.emit(this.isCollapsed);
  }
}
