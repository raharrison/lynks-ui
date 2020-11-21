import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./error/error.module').then(m => m.ErrorModule),
  },
  {
    path: '**',
    pathMatch: 'full',
    loadChildren: () =>
      import('./error/error.module').then(m => m.ErrorModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
