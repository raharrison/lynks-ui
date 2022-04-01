import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {EntryType, SlimNote} from "@shared/models";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-note-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './note-list-item.component.html',
  styleUrls: ['./note-list-item.component.scss']
})
export class NoteListItemComponent {

  @Input()
  note: SlimNote;

  notePath: string;

  constructor(private routeProvider: RouteProviderService) {
    this.notePath = this.routeProvider.entryDefsByType[EntryType.NOTE].path;
  }

}
