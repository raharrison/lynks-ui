import {Component, OnInit} from '@angular/core';
import {Collection} from "@shared/models";
import {CollectionService} from "@shared/services/collection.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DisplayGroup} from "@app/group/model/display-group.model";
import {DeleteConfirmModalComponent} from "@shared/components";
import {Subscription} from "rxjs";

@Component({
  selector: 'lks-collection-edit',
  templateUrl: './collection-edit.component.html',
  styleUrls: ['./collection-edit.component.scss']
})
export class CollectionEditComponent implements OnInit {

  private collectionSubscription: Subscription;
  private rootId: string = "1";

  collectionTree: DisplayGroup[] = [];
  collectionsToParent: { string, Collection } = <{ string, Collection }>{};
  editingCollection: Collection = null;
  newCollectionSaving = false;
  newCollectionName = "";
  newCollectionSelectedParent: Collection[] = [];

  constructor(private modalService: NgbModal,
              private collectionService: CollectionService) {
  }

  ngOnInit(): void {
    this.collectionSubscription = this.collectionService.$collections.subscribe(cols => {
      this.collectionTree = [{
        id: this.rootId,
        name: "Collections",
        children: this.buildCollectionModel(cols),
        isExpanded: true
      }];
    });
  }

  private buildCollectionModel(cols: Collection[]): DisplayGroup[] {
    return cols.map(col => {
      const children = this.buildCollectionModel(col.children);
      children.forEach(c => this.collectionsToParent[c.id] = col);
      return {
        id: col.id,
        name: col.name,
        children: children,
        isExpanded: true
      }
    });
  }

  onCollectionSave() {
    this.newCollectionSaving = true;
    const handler = {
      next: () => {
        this.newCollectionSaving = false;
        this.editingCollection = null;
        this.newCollectionSelectedParent = [];
        this.collectionService.refreshCollections();
        this.modalService.dismissAll();
      },
      error: () => {
        this.newCollectionSaving = false;
      }
    }
    const newCollection = {
      name: this.newCollectionName,
      parentId: this.newCollectionSelectedParent.length == 0 ? null : this.newCollectionSelectedParent[0].id
    };
    if (this.editingCollection == null) {
      this.collectionService.createCollection(newCollection).subscribe(handler);
    } else {
      this.collectionService.updateCollection({
        id: this.editingCollection.id,
        ...newCollection
      }).subscribe(handler);
    }
  }

  onCollectionDelete() {
    if (this.editingCollection != null) {
      const modalRef = this.modalService.open(DeleteConfirmModalComponent);
      modalRef.componentInstance.data = this.editingCollection;
      modalRef.componentInstance.type = "collection";

      modalRef.result.then(closeData => {
        if (closeData) {
          this.deleteCollection(this.editingCollection.id);
        }
      }, () => {
      });
    }
  }

  private deleteCollection(id: string) {
    this.collectionService.deleteCollection(id).subscribe({
      next: () => {
        this.newCollectionSaving = false;
        this.editingCollection = null;
        this.collectionService.refreshCollections();
      },
      error: () => {
        this.newCollectionSaving = false;
      }
    });
  }

  onCreateCollection(editDialog) {
    this.newCollectionSelectedParent = this.editingCollection ? [this.editingCollection] : [];
    this.editingCollection = null;
    this.openEditDialog(editDialog);
  }

  setEditingCollection(collection) {
    if (collection.id != this.rootId) {
      this.editingCollection = collection;
    } else {
      this.editingCollection = null;
    }
  }

  openEditDialog(editDialog) {
    if (this.editingCollection != null) {
      this.newCollectionName = this.editingCollection.name;
      if (this.collectionsToParent.hasOwnProperty(this.editingCollection.id)) {
        this.newCollectionSelectedParent = [this.collectionsToParent[this.editingCollection.id]];
      } else {
        this.newCollectionSelectedParent = [];
      }
    } else {
      this.newCollectionName = "";
    }
    this.modalService.open(editDialog, {size: "lg"});
  }

  ngOnDestroy(): void {
    if (this.collectionSubscription != null) {
      this.collectionSubscription.unsubscribe();
    }
  }
}
