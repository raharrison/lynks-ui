import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from '@app/shared/shared.module';
import * as notifyContainers from './containers';
import {NotifyRoutingModule} from "./notify-routing.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NotifyRoutingModule
  ],
  declarations: [...notifyContainers.containers],
})
export class NotifyModule {
}
