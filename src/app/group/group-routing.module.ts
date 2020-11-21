import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import * as groupContainers from './containers';
import {RouteData} from "@shared/models";

export const ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: groupContainers.GroupViewComponent,
    data: {
      title: 'Groups',
    } as RouteData,
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class GroupRoutingModule {
}
