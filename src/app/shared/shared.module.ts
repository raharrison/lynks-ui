import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ToastrModule} from "ngx-toastr";

import * as sharedComponents from './components';
import * as sharedContainers from './containers';
import * as sharedPipes from './pipes';
import {HighlightModule} from "ngx-highlightjs";
import {NgSelectModule} from "@ng-select/ng-select";

const angularLibs = [RouterModule, FormsModule, ReactiveFormsModule];
const thirdParty = [NgbModule, HighlightModule, NgSelectModule];

@NgModule({
  imports: [CommonModule, angularLibs, ...thirdParty, ToastrModule.forRoot()],
  declarations: [...sharedComponents.components, sharedContainers.containers, ...sharedPipes.pipes],
  exports: [...sharedComponents.components, sharedContainers.containers, ...sharedPipes.pipes, ...angularLibs, ...thirdParty]
})
export class SharedModule {
}
