import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AttachmentViewComponent} from "@app/attachment/containers";
import {RouteData} from "@shared/models";
import {SnippetDetailComponent, SnippetEditComponent} from "@app/entry-snippet/containers";

export const ROUTES: Routes = [
  {
    path: 'create',
    component: SnippetEditComponent,
    data: {
      title: "Create Snippet"
    } as RouteData
  },
  {
    path: ':id/edit',
    component: SnippetEditComponent,
    data: {
      title: "Edit Snippet"
    } as RouteData
  },
  {
    path: ':id/attachment/:attachmentId',
    component: AttachmentViewComponent
  },
  {
    path: ':id/:version',
    component: SnippetDetailComponent
  },
  {
    path: ':id',
    component: SnippetDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class EntrySnippetRoutingModule {
}
