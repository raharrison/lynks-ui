import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {NoteListComponent} from "./entry/note/note-list/note-list.component";

const routes: Routes = [
  { path: "notes", component: NoteListComponent },
  // { path: "links", component: LinkListComponent },
  { path: "", redirectTo: "/notes", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
