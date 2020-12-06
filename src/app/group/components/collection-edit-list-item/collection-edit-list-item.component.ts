import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Collection, NewCollection} from "@shared/models";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DeleteConfirmModalComponent} from "@shared/components";
import {CollectionService} from "@shared/services/collection.service";

@Component({
  selector: 'tr[lks-collection-edit-list-item]',
  templateUrl: './collection-edit-list-item.component.html',
  styleUrls: ['./collection-edit-list-item.component.scss']
})
export class CollectionEditListItemComponent implements OnInit {

  @Input()
  collection: Collection;

  @Output()
  collectionModified = new EventEmitter<Collection>();

  editMode = false;
  collectionNameInput: string;

  constructor(private collectionService: CollectionService,
              private modalService: NgbModal) {
  }

  ngOnInit() {
  }

  openDeleteModal(event: Event, collection: Collection) {
    event.stopPropagation();
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.data = collection;
    modalRef.componentInstance.type = "collection";

    modalRef.result.then(closeData => {
      if (closeData) {
        this.deleteCollection(closeData);
      }
    }, () => {
    });
  }

  private deleteCollection(collection: Collection) {
    this.collectionService.deleteCollection(collection.id)
      .subscribe(_ => {
        this.collectionModified.emit(collection);
      });
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.editMode = true;
    this.collectionNameInput = this.collection.name;
  }

  onSaveClick(event: Event) {
    event.stopPropagation();
    const updatedCollection: NewCollection = {
      id: this.collection.id,
      name: this.collectionNameInput,
      parentId: null
    };
    this.collectionService.updateCollection(updatedCollection)
      .subscribe(res => {
        this.collection = res;
        this.editMode = false;
        this.collection.name = this.collectionNameInput;
        this.collectionNameInput = null;
      });
  }

  onEditCancelClick(event: Event) {
    event.stopPropagation();
    this.editMode = false;
    this.collectionNameInput = null;
  }

}
