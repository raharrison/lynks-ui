import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LinkDetailComponent, LinkEditComponent} from "@app/entry-link/containers";
import {AttachmentViewComponent} from "@app/attachment/containers";
import {RouteData} from "@shared/models";

export const ROUTES: Routes = [
  {
    path: 'create',
    component: LinkEditComponent,
    data: {
      title: "Create Link"
    } as RouteData
  },
  {
    path: ':id/edit',
    component: LinkEditComponent,
    data: {
      title: "Edit Link"
    } as RouteData
  },
  {
    path: ':id/attachment/:attachmentId',
    component: AttachmentViewComponent
  },
  {
    path: ':id/:version',
    component: LinkDetailComponent
  },
  {
    path: ':id',
    component: LinkDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class EntryLinkRoutingModule {
}
