import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import * as dashboardContainers from './containers';
import {LoggedInGuard} from "@shared/guards/logged-in.guard";

export const ROUTES: Routes = [
  {
    path: '',
    component: dashboardContainers.DashboardComponent,
    canActivate: [LoggedInGuard],
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
        path: 'entries/snippets',
        loadChildren: () =>
          import('../entry-snippet/entry-snippet.module').then(m => m.EntrySnippetModule)
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
      },
      {
        path: 'user',
        loadChildren: () =>
          import('../user/user.module').then(m => m.UserModule)
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
