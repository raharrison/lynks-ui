import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {ToastrModule} from "ngx-toastr";
import {TagInputModule} from "ngx-chips";
import {HIGHLIGHT_OPTIONS, HighlightModule} from 'ngx-highlightjs';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from "./components/header/header.component";
import {BackButtonDirective} from './directives/back-button.directive';
import {EntryListComponent} from './components/entry/entry-list/entry-list.component';
import {NoteListItemComponent} from './components/entry/entry-list/note-list-item/note-list-item.component';
import {NoteDetailComponent} from './components/entry/entry-detail/note-detail/note-detail.component';
import {NoteEditComponent} from './components/entry/entry-edit/note-edit/note-edit.component';
import {MarkdownEditorComponent} from './components/utils/markdown-editor/markdown-editor.component';
import {MarkdownViewComponent} from './components/utils/markdown-view/markdown-view.component';
import {GroupEditComponent} from './components/group/group-edit/group-edit.component';
import {LinkListItemComponent} from './components/entry/entry-list/link-list-item/link-list-item.component';
import {CommentListComponent} from './components/comment/comment-list/comment-list.component';
import {CommentEditComponent} from './components/comment/comment-edit/comment-edit.component';
import {TimeAgoComponent} from './components/utils/time-ago/time-ago.component';
import {DeleteConfirmModalComponent} from './components/utils/delete-confirm-modal/delete-confirm-modal.component';
import {EntryTabsComponent} from './components/entry/entry-tabs/entry-tabs.component';
import {AttachmentListComponent} from './components/attachment/attachment-list/attachment-list.component';
import {AttachmentUploadComponent} from './components/attachment/attachment-upload/attachment-upload.component';
import {AttachmentViewComponent} from './components/attachment/attachment-view/attachment-view.component';
import {AttachmentListItemComponent} from './components/attachment/attachment-list/attachment-list-item/attachment-list-item.component';
import {FileSizeComponent} from './components/utils/file-size/file-size.component';
import {LoadingSpinnerComponent} from './components/utils/loading-spinner/loading-spinner.component';
import {LinkDetailComponent} from './components/entry/entry-detail/link-detail/link-detail.component';
import {EntryTaskListComponent} from './components/entry/entry-tabs/entry-task-list/entry-task-list.component';
import {SafeUrlPipe} from './pipes/safe-url.pipe';
import {EntryDiscussionListComponent} from './components/entry/entry-tabs/entry-discussion-list/entry-discussion-list.component';
import {LinkEditComponent} from './components/entry/entry-edit/link-edit/link-edit.component';
import {EntryHistoryComponent} from './components/entry/entry-tabs/entry-history/entry-history.component';
import {EntryDetailHeaderComponent} from './components/entry/entry-detail/entry-detail-header/entry-detail-header.component';
import {GroupViewComponent} from './components/group/group-view/group-view.component';
import {EntryDetailMetadataComponent} from './components/entry/entry-detail/entry-detail-metadata/entry-detail-metadata.component';
import {EntryAuditComponent} from './components/entry/entry-tabs/entry-audit/entry-audit.component';

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
    LinkListItemComponent, CommentListComponent, CommentEditComponent, TimeAgoComponent, DeleteConfirmModalComponent,
    EntryTabsComponent, AttachmentListComponent, AttachmentUploadComponent, AttachmentViewComponent, AttachmentListItemComponent,
    FileSizeComponent, BackButtonDirective, LoadingSpinnerComponent, LinkDetailComponent, EntryTaskListComponent, SafeUrlPipe,
    EntryDiscussionListComponent, LinkEditComponent, EntryHistoryComponent, EntryDetailHeaderComponent, GroupViewComponent,
    EntryDetailMetadataComponent, EntryAuditComponent
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
