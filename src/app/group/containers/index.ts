import {GroupViewComponent} from './group-view/group-view.component';
import {CollectionEditComponent} from "@app/group/containers/collection-edit/collection-edit.component";
import {TagEditComponent} from "@app/group/containers/tag-edit/tag-edit.component";

export const containers = [GroupViewComponent, CollectionEditComponent, TagEditComponent];

export * from './group-view/group-view.component';
export * from './collection-edit/collection-edit.component';
export * from './tag-edit/tag-edit.component';
