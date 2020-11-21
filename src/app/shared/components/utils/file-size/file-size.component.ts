import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import * as fileSize from "filesize";

@Component({
  selector: 'lks-file-size',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: "<span>{{ formatBytes() }}</span>"
})
export class FileSizeComponent {

  @Input()
  bytes: number;

  constructor() {
  }

  formatBytes(): string {
    return this.bytes == null ? '' : fileSize(this.bytes);
  }
}
