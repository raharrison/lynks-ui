import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RouteData} from "@shared/models";
import * as notifyContainers from './containers';

export const ROUTES: Routes = [
  {
    path: '',
    canActivate: [],
    component: notifyContainers.NotificationListComponent,
    data: {
      title: 'Notifications',
    } as RouteData,
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class NotifyRoutingModule {
}
