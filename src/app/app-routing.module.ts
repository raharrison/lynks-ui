import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EntryListComponent} from "./entry/entry-list/entry-list.component";

const routes: Routes = [
  { path: "notes", component: EntryListComponent },
  // { path: "links", component: LinkListComponent },
  { path: "", redirectTo: "/notes", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
