import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import * as authContainers from './containers';
import {RouteData} from "@shared/models";

export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
    },
    {
        path: 'login',
        canActivate: [],
        component: authContainers.LoginComponent,
        data: {
            title: 'Login - Lynks',
        } as RouteData,
    },
    {
        path: 'register',
        canActivate: [],
        component: authContainers.RegisterComponent,
        data: {
            title: 'Register - Lynks',
        } as RouteData,
    },
    {
        path: 'forgot-password',
        canActivate: [],
        component: authContainers.ForgotPasswordComponent,
        data: {
            title: 'Forgot Password - Lynks',
        } as RouteData,
    },
];

@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class AuthRoutingModule {
}
