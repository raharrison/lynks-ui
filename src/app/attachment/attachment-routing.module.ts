import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AttachmentViewComponent} from "@app/attachment/containers";
import {AttachmentModule} from "@app/attachment/attachment.module";

export const ROUTES: Routes = [
  {
    path: ':id/:attachmentId',
    component: AttachmentViewComponent
  }
];

@NgModule({
  imports: [AttachmentModule, RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class AttachmentRoutingModule {
}
