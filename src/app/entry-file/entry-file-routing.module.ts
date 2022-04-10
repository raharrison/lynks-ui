import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AttachmentViewComponent} from "@app/attachment/containers";
import {RouteData} from "@shared/models";
import {FileDetailComponent, FileEditComponent} from "@app/entry-file/containers";

export const ROUTES: Routes = [
  {
    path: 'create',
    component: FileEditComponent,
    data: {
      title: "Create File"
    } as RouteData
  },
  {
    path: ':id/edit',
    component: FileEditComponent,
    data: {
      title: "Edit File"
    } as RouteData
  },
  {
    path: ':id/attachment/:attachmentId',
    component: AttachmentViewComponent
  },
  {
    path: ':id/:version',
    component: FileDetailComponent
  },
  {
    path: ':id',
    component: FileDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class EntryFileRoutingModule {
}
