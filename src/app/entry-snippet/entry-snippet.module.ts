import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from "@app/shared/shared.module";
import * as entrySnippetContainers from './containers';
import {EntrySnippetRoutingModule} from "./entry-snippet-routing.module";
import {EntryModule} from "@app/entry/entry.module";
import {AttachmentModule} from "@app/attachment/attachment.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    EntryModule,
    EntrySnippetRoutingModule,
    AttachmentModule
  ],
  declarations: [...entrySnippetContainers.containers]
})
export class EntrySnippetModule {
}
