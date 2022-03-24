import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";

import {SharedModule} from "@app/shared/shared.module";
import * as navigationComponents from './components';
import * as navigationContainers from './containers';
import * as navigationLayouts from './layouts';
import {NgScrollbarModule} from "ngx-scrollbar";

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule, NgScrollbarModule],
  declarations: [
    ...navigationContainers.containers,
    ...navigationComponents.components,
    ...navigationLayouts.layouts
  ],
  exports: [
    ...navigationContainers.containers,
    ...navigationComponents.components,
    ...navigationLayouts.layouts
  ],
})
export class NavigationModule {
}
