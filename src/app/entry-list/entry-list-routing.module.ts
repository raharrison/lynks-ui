import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EntryListComponent} from "@app/entry-list/containers";
import {EntryType, RouteData} from "@shared/models";

export const ROUTES: Routes = [
  {
    path: '',
    component: EntryListComponent,
    data: {
      title: 'Entries',
    } as RouteData,
  },
  {
    path: 'links',
    data: {entryType: EntryType.LINK, title: "Links"},
    component: EntryListComponent,
  },
  {
    path: 'notes',
    data: {entryType: EntryType.NOTE, title: "Notes"},
    component: EntryListComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class EntryListRoutingModule {
}
