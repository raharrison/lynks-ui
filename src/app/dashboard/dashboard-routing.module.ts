import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import * as dashboardContainers from './containers';

export const ROUTES: Routes = [
  {
    path: '',
    component: dashboardContainers.DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: "full",
        redirectTo: "entries"
      },
      {
        path: 'entries',
        loadChildren: () =>
          import('../entry-list/entry-list.module').then(m => m.EntryListModule)
      },
      {
        path: 'notes',
        loadChildren: () =>
          import('../entry-note/entry-note.module').then(m => m.EntryNoteModule)
      },
      {
        path: 'links',
        loadChildren: () =>
          import('../entry-link/entry-link.module').then(m => m.EntryLinkModule)
      },
      {
        path: 'attachment',
        loadChildren: () =>
          import('../attachment/attachment-routing.module').then(m => m.AttachmentRoutingModule)
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {
}
