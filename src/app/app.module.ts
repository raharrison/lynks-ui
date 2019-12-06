import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from "./header/header.component";
import {HttpClientModule} from "@angular/common/http";
import {EntryListComponent} from './entry/entry-list/entry-list.component';
import {NoteListItemComponent} from './entry/entry-list/note-list-item/note-list-item.component';
import {NoteDetailComponent} from './entry/entry-detail/note-detail/note-detail.component';

@NgModule({
    declarations: [
        AppComponent, HeaderComponent, EntryListComponent, NoteListItemComponent, NoteDetailComponent
    ],
    imports: [
        BrowserModule,
        NgbModule,
        HttpClientModule,
        AppRoutingModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
