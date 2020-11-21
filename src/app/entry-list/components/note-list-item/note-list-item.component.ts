import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {SlimNote} from "@shared/models";

@Component({
  selector: 'lks-note-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './note-list-item.component.html',
  styleUrls: ['./note-list-item.component.scss']
})
export class NoteListItemComponent {

  @Input()
  note: SlimNote;

  constructor() {
  }

}
