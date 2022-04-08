import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from '@app/shared/shared.module';
import {UserRoutingModule} from "@app/user/user-routing.module";
import * as userContainers from './containers';
import * as userComponents from './components';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    UserRoutingModule
  ],
  declarations: [...userContainers.containers, ...userComponents.components]
})
export class UserModule {
}
