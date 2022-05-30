import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import * as groupContainers from './containers';
import {SharedModule} from "@app/shared/shared.module";
import {NavigationModule} from "@app/navigation/navigation.module";
import {GroupRoutingModule} from "@app/group/group-routing.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NavigationModule,
    GroupRoutingModule
  ],
  declarations: [...groupContainers.containers]
})
export class GroupModule {
}
