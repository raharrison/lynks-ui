import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EntryListComponent} from "./components/entry/entry-list/entry-list.component";
import {NoteDetailComponent} from "./components/entry/entry-detail/note-detail/note-detail.component";
import {NoteEditComponent} from "./components/entry/entry-edit/note-edit/note-edit.component";
import {AttachmentViewComponent} from "./components/attachment/attachment-view/attachment-view.component";
import {LinkDetailComponent} from "./components/entry/entry-detail/link-detail/link-detail.component";
import {LinkEditComponent} from "./components/entry/entry-edit/link-edit/link-edit.component";

const routes: Routes = [
  {path: "entry/:id/attachment/:attachmentId", component: AttachmentViewComponent},

  {path: "notes/create", component: NoteEditComponent},
  {path: "notes/:id/edit", component: NoteEditComponent},
  {path: "notes/:id", component: NoteDetailComponent},
  {path: "notes", component: EntryListComponent},

  {path: "links/create", component: LinkEditComponent},
  {path: "links/:id/edit", component: LinkEditComponent},
  {path: "links/:id", component: LinkDetailComponent},
  {path: "", redirectTo: "/notes", pathMatch: "full"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
