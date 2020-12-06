import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {Collection, NewCollection} from "@shared/models";
import {NgForm} from "@angular/forms";
import {CollectionService} from "@shared/services/collection.service";

@Component({
  selector: 'lks-collection-edit',
  templateUrl: './collection-edit.component.html',
  styleUrls: ['./collection-edit.component.scss']
})
export class CollectionEditComponent implements OnInit {

  $collections: Observable<[Collection]>;

  newCollectionSaving = false;
  newCollectionName = "";
  newCollectionSelectedParent: Collection[] = [];

  constructor(private collectionService: CollectionService) {
  }

  ngOnInit(): void {
    this.retrieveCollections();
  }

  retrieveCollections() {
    this.$collections = this.collectionService.getCollections()
  }

  onCollectionSave(collectionForm: NgForm) {
    const newCollection: NewCollection = {
      name: this.newCollectionName,
      parentId: this.newCollectionSelectedParent.length == 0 ? null : this.newCollectionSelectedParent[0].id
    }
    this.newCollectionSaving = true;
    this.collectionService.createCollection(newCollection).subscribe(res => {
      collectionForm.form.reset();
      this.newCollectionSaving = false;
      this.newCollectionSelectedParent = [];
      this.retrieveCollections();
    });
  }

}
