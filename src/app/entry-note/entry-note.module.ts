import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from "@app/shared/shared.module";
import * as entryNoteContainers from './containers';
import {EntryNoteRoutingModule} from "./entry-note-routing.module";
import {EntryModule} from "@app/entry/entry.module";
import {AttachmentModule} from "@app/attachment/attachment.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    EntryModule,
    EntryNoteRoutingModule,
    AttachmentModule
  ],
  declarations: [...entryNoteContainers.containers]
})
export class EntryNoteModule {
}
