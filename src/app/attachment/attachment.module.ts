import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from "@shared/shared.module";

import * as attachmentComponents from './components';
import * as attachmentContainers from './containers';

@NgModule({
  declarations: [...attachmentComponents.components, ...attachmentContainers.containers],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [...attachmentComponents.components, ...attachmentContainers.containers],
})
export class AttachmentModule {
}
