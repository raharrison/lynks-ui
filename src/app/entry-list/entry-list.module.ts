import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from "@app/shared/shared.module";
import * as entryListContainers from './containers';
import * as entryListComponents from './components';
import {EntryListRoutingModule} from "@app/entry-list/entry-list-routing.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    EntryListRoutingModule
  ],
  declarations: [...entryListContainers.containers, ...entryListComponents.components]
})
export class EntryListModule {
}
