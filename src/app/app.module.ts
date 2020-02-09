import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from "./header/header.component";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {EntryListComponent} from './entry/entry-list/entry-list.component';
import {NoteListItemComponent} from './entry/entry-list/note-list-item/note-list-item.component';
import {NoteDetailComponent} from './entry/entry-detail/note-detail/note-detail.component';
import {NoteEditComponent} from './entry/entry-edit/note-edit/note-edit.component';
import {MarkdownEditorComponent} from './utils/markdown-editor/markdown-editor.component';
import {TagInputModule} from "ngx-chips";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
    declarations: [
        AppComponent, HeaderComponent, EntryListComponent, NoteListItemComponent, NoteDetailComponent, NoteEditComponent, MarkdownEditorComponent
    ],
    imports: [
        BrowserModule,
        NgbModule,
        FormsModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        TagInputModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
