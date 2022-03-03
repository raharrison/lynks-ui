import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NoteDetailComponent, NoteEditComponent} from "@app/entry-note/containers";
import {AttachmentViewComponent} from "@app/attachment/containers";

export const ROUTES: Routes = [
  {
    path: 'create',
    component: NoteEditComponent,
  },
  {
    path: ':id/edit',
    component: NoteEditComponent
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
