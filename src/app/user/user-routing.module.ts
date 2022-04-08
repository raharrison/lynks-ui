import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {RouteData} from "@shared/models";
import * as userContainers from './containers';

export const ROUTES: Routes = [
  {
    path: '',
    pathMatch: "full",
    redirectTo: "settings"
  },
  {
    path: 'settings',
    canActivate: [],
    component: userContainers.UserSettingsComponent,
    data: {
      title: 'User Settings',
    } as RouteData,
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class UserRoutingModule {
}
