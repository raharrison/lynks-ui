import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import * as errorContainers from './containers';
import {RouteData} from "@shared/models";

export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '404',
    },
    {
        path: '401',
        canActivate: [],
        component: errorContainers.Error401Component,
        data: {
          title: 'Unauthorized',
        } as RouteData,
    },
    {
        path: '404',
        canActivate: [],
        component: errorContainers.Error404Component,
        data: {
          title: 'Not Found',
        } as RouteData,
    },
    {
        path: '500',
        canActivate: [],
        component: errorContainers.Error500Component,
        data: {
          title: 'Server Error',
        } as RouteData,
    },
    {
        path: '**',
        pathMatch: 'full',
        component: errorContainers.Error404Component,
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class ErrorRoutingModule {
}
