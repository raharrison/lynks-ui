import {CardComponent} from './card/card.component';
import {GroupViewComponent} from "./group/group-view/group-view.component";
import {GroupEditComponent} from "./group/group-edit/group-edit.component";
import {TimeAgoComponent} from "./utils/time-ago/time-ago.component";
import {MarkdownViewComponent} from "./markdown/markdown-view/markdown-view.component";
import {DeleteConfirmModalComponent} from "./utils/delete-confirm-modal/delete-confirm-modal.component";
import {MarkdownEditorComponent} from "./markdown/markdown-editor/markdown-editor.component";
import {FileSizeComponent} from "./utils/file-size/file-size.component";
import {LoadingSpinnerComponent} from "./utils/loading-spinner/loading-spinner.component";

export const components = [
  CardComponent,
  GroupViewComponent,
  GroupEditComponent,
  MarkdownViewComponent,
  MarkdownEditorComponent,
  TimeAgoComponent,
  DeleteConfirmModalComponent,
  FileSizeComponent,
  LoadingSpinnerComponent
];

export * from './card/card.component';
export * from './group/group-view/group-view.component';
export * from './group/group-edit/group-edit.component';
export * from './markdown/markdown-view/markdown-view.component';
export * from './markdown/markdown-editor/markdown-editor.component';
export * from './utils/time-ago/time-ago.component';
export * from './utils/delete-confirm-modal/delete-confirm-modal.component';
export * from './utils/file-size/file-size.component';
export * from './utils/loading-spinner/loading-spinner.component';
