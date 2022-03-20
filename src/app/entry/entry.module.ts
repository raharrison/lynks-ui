import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from "@app/shared/shared.module";
import {CommentModule} from "@app/comment/comment.module";
import * as entryComponents from './components';
import * as entryContainers from './containers';
import {ReminderModule} from "@app/reminder/reminder.module";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    CommentModule,
    ReminderModule
  ],
  declarations: [...entryComponents.components, ...entryContainers.containers],
  exports: [...entryComponents.components, ...entryContainers.containers]
})
export class EntryModule {
}
