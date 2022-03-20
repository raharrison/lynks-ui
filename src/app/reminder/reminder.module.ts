import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from "@shared/shared.module";

import * as reminderComponents from './components';
import * as reminderContainers from './containers';

@NgModule({
  declarations: [...reminderComponents.components, ...reminderContainers.containers],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [...reminderComponents.components, ...reminderContainers.containers],
})
export class ReminderModule {
}
