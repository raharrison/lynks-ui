import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from "@app/shared/shared.module";
import {EntryLinkRoutingModule} from "./entry-link-routing.module";
import {EntryModule} from "@app/entry/entry.module";
import {AttachmentModule} from "@app/attachment/attachment.module";
import * as entryLinkContainers from './containers';
import * as entryLinkComponents from './components';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    EntryModule,
    EntryLinkRoutingModule,
    AttachmentModule
  ],
  declarations: [...entryLinkContainers.containers, ...entryLinkComponents.components]
})
export class EntryLinkModule {
}
