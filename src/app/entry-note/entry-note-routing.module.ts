import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NoteDetailComponent, NoteEditComponent} from "@app/entry-note/containers";
import {AttachmentViewComponent} from "@app/attachment/containers";
import {RouteData} from "@shared/models";

export const ROUTES: Routes = [
  {
    path: 'create',
    component: NoteEditComponent,
    data: {
      title: "Create Note"
    } as RouteData
  },
  {
    path: ':id/edit',
    component: NoteEditComponent,
    data: {
      title: "Edit Note"
    } as RouteData
  },
  {
    path: ':id/attachment/:attachmentId',
    component: AttachmentViewComponent
  },
  {
    path: ':id/:version',
    component: NoteDetailComponent
  },
  {
    path: ':id',
    component: NoteDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class EntryNoteRoutingModule {
}
