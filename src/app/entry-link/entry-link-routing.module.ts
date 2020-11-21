import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LinkDetailComponent, LinkEditComponent} from "@app/entry-link/containers";

export const ROUTES: Routes = [
  {
    path: 'create',
    component: LinkEditComponent,
  },
  {
    path: ':id/edit',
    component: LinkEditComponent
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
