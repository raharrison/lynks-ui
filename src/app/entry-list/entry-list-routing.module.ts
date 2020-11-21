import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EntryListComponent} from "@app/entry-list/containers";
import {EntryType} from "@shared/models";

export const ROUTES: Routes = [
  {
    path: '',
    component: EntryListComponent
  },
  {
    path: 'links',
    data: {entryType: EntryType.LINK},
    component: EntryListComponent,
  },
  {
    path: 'notes',
    data: {entryType: EntryType.NOTE},
    component: EntryListComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class EntryListRoutingModule {
}
