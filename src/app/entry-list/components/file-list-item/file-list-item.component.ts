import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {EntryType, SlimFile} from "@shared/models";
import {RouteProviderService} from "@shared/services/route-provider.service";

@Component({
  selector: 'lks-file-list-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './file-list-item.component.html',
  styleUrls: ['./file-list-item.component.scss']
})
export class FileListItemComponent {

  @Input()
  file: SlimFile;

  filePath: string;

  constructor(private routeProvider: RouteProviderService) {
    this.filePath = this.routeProvider.entryDefsByType[EntryType.FILE].path;
  }

}
