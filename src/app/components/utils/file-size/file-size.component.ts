import {Component, Input, OnInit} from '@angular/core';
import * as fileSize from "filesize";

@Component({
  selector: 'app-file-size',
  template: "<span>{{ formatBytes() }}</span>"
})
export class FileSizeComponent implements OnInit {

  @Input()
  bytes: number;

  formatBytes(): string {
    return this.bytes == null ? '' : fileSize(this.bytes);
  }

  constructor() {
  }

  ngOnInit(): void {
  }

}
