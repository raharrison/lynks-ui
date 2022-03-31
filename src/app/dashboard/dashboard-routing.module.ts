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
        path: 'entries/notes',
        loadChildren: () =>
          import('../entry-note/entry-note.module').then(m => m.EntryNoteModule)
      },
      {
        path: 'entries/links',
        loadChildren: () =>
          import('../entry-link/entry-link.module').then(m => m.EntryLinkModule)
      },
      {
        path: 'groups',
        loadChildren: () =>
          import('../group/group.module').then(m => m.GroupModule),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('../notify/notify.module').then(m => m.NotifyModule),
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
