import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SharedModule} from '@app/shared/shared.module';
import {NavigationModule} from '@app/navigation/navigation.module';
import * as authContainers from './containers';
import * as authLayouts from './layouts';
import {AuthRoutingModule} from "@app/auth/auth-routing.module";

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        NavigationModule,
        AuthRoutingModule
    ],
    declarations: [...authContainers.containers, ...authLayouts.layouts],
})
export class AuthModule {
}
