import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from "./components/header/header.component";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {EntryListComponent} from './components/entry/entry-list/entry-list.component';
import {NoteListItemComponent} from './components/entry/entry-list/note-list-item/note-list-item.component';
import {NoteDetailComponent} from './components/entry/entry-detail/note-detail/note-detail.component';
import {NoteEditComponent} from './components/entry/entry-edit/note-edit/note-edit.component';
import {MarkdownEditorComponent} from './components/utils/markdown-editor/markdown-editor.component';
import {TagInputModule} from "ngx-chips";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MarkdownViewComponent} from './components/utils/markdown-view/markdown-view.component';
import {HIGHLIGHT_OPTIONS, HighlightModule} from 'ngx-highlightjs';
import {GroupEditComponent} from './components/group/group-edit/group-edit.component';
import {ToastrModule} from "ngx-toastr";
import {LinkListItemComponent} from './components/entry/entry-list/link-list-item/link-list-item.component';
import {CommentListComponent} from './components/comment/comment-list/comment-list.component';
import {CommentEditComponent} from './components/comment/comment-edit/comment-edit.component';
import {TimeAgoComponent} from './components/utils/time-ago/time-ago.component';
import {DeleteConfirmModalComponent} from './components/utils/delete-confirm-modal/delete-confirm-modal.component';

function getHighlightLanguages() {
    return ["bash", "cpp", "cs", "css", "gradle", "handlebars", "java",
        "javascript", "json", "kotlin", "nginx", "plaintext", "python",
        "shell", "sql", "typescript", "xml"].reduce((res, lang) => {
        res[lang] = () => import('highlight.js/lib/languages/' + lang);
        return res;
    }, {});
}

@NgModule({
    declarations: [
        AppComponent, HeaderComponent, EntryListComponent, NoteListItemComponent,
        NoteDetailComponent, NoteEditComponent, MarkdownEditorComponent, MarkdownViewComponent, GroupEditComponent,
        LinkListItemComponent, CommentListComponent, CommentEditComponent, TimeAgoComponent, DeleteConfirmModalComponent
    ],
    imports: [
        BrowserModule,
        NgbModule,
        FormsModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        TagInputModule,
        HighlightModule,
        ToastrModule.forRoot()
    ],
    providers: [{
        provide: HIGHLIGHT_OPTIONS,
        useValue: {
            languages: getHighlightLanguages(),
            lineNumbers: true
        }
    }],
    bootstrap: [AppComponent]
})
export class AppModule {
}
