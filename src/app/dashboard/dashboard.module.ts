import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from "@app/shared/shared.module";
import {NavigationModule} from '@app/navigation/navigation.module';
import * as dashboardContainers from './containers';
import * as dashboardComponents from './components';
import {DashboardRoutingModule} from "./dashboard-routing.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NavigationModule,
    DashboardRoutingModule,
  ],
  declarations: [...dashboardContainers.containers, ...dashboardComponents.components],
})
export class DashboardModule {
}
