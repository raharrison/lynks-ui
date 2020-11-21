import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from "@shared/shared.module";
import * as commentContainers from './containers';

@NgModule({
  declarations: [...commentContainers.containers],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [...commentContainers.containers]
})
export class CommentModule {
}
