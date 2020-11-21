import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import * as errorContainers from './containers';
import * as errorLayouts from './layouts';
import {SharedModule} from "@app/shared/shared.module";
import {ErrorRoutingModule} from "@app/error/error-routing.module";
import {NavigationModule} from "@app/navigation/navigation.module";

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        NavigationModule,
        ErrorRoutingModule
    ],
    declarations: [...errorContainers.containers, ...errorLayouts.layouts]
})
export class ErrorModule {
}
