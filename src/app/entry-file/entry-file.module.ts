import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from "@app/shared/shared.module";
import * as entryFileContainers from './containers';
import {EntryModule} from "@app/entry/entry.module";
import {AttachmentModule} from "@app/attachment/attachment.module";
import {EntryFileRoutingModule} from "@app/entry-file/entry-file-routing.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    EntryModule,
    EntryFileRoutingModule,
    AttachmentModule
  ],
  declarations: [...entryFileContainers.containers]
})
export class EntryFileModule {
}
