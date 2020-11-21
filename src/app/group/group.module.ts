import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import * as groupContainers from './containers';
import * as groupComponents from './components';
import {SharedModule} from "@app/shared/shared.module";
import {NavigationModule} from "@app/navigation/navigation.module";
import {GroupRoutingModule} from "@app/group/group-routing.module";
import {TagEditComponent} from './containers/tag-edit/tag-edit.component';
import {TagEditListItemComponent} from './components/tag-edit-list-item/tag-edit-list-item.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NavigationModule,
    GroupRoutingModule
  ],
  declarations: [...groupContainers.containers, ...groupComponents.components, TagEditComponent, TagEditListItemComponent]
})
export class GroupModule {
}
