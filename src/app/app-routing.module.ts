import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EntryListComponent} from "./entry/entry-list/entry-list.component";
import {NoteDetailComponent} from "./entry/entry-detail/note-detail/note-detail.component";
import {NoteEditComponent} from "./entry/entry-edit/note-edit/note-edit.component";

const routes: Routes = [
  { path: "notes/create", component: NoteEditComponent },
  { path: "notes/:id/edit", component: NoteEditComponent },
  { path: "notes/:id", component: NoteDetailComponent },
  { path: "notes", component: EntryListComponent },
  // { path: "links", component: LinkListComponent },
  { path: "", redirectTo: "/notes", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
