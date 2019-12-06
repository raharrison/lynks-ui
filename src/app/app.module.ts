import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from "./header/header.component";
import {HttpClientModule} from "@angular/common/http";
import {EntryListComponent} from './entry/entry-list/entry-list.component';
import {NoteListItemComponent} from './entry/entry-list/note-list-item/note-list-item.component';

@NgModule({
    declarations: [
        AppComponent, HeaderComponent, EntryListComponent, NoteListItemComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        HttpClientModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
