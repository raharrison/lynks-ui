import {Component, Input, OnInit} from '@angular/core';
import {Entry} from "../../../../model/entry.model";
import {DeleteConfirmModalComponent} from "../../../utils/delete-confirm-modal/delete-confirm-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {EntryService} from "../../../../services/entry.service";

@Component({
  selector: 'app-entry-detail-header',
  templateUrl: './entry-detail-header.component.html',
  styleUrls: ['./entry-detail-header.component.css']
})
export class EntryDetailHeaderComponent implements OnInit {

  @Input()
  entry: Entry;

  @Input()
  previousVersion: boolean;

  constructor(private router: Router,
              private modalService: NgbModal,
              private entryService: EntryService) {
  }

  ngOnInit(): void {
  }

  openDeleteModal() {
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.data = this.entry;
    modalRef.componentInstance.type = this.entry.type.toLowerCase();

    modalRef.result.then(closeData => {
      if (closeData) {
        this.deleteEntry(closeData);
      }
    }, () => {
    });
  }

  private deleteEntry(entry: Entry) {
    const service = this.entryService.resolveService(this.entry.type);
    service.delete(entry.id).subscribe(() => {
      this.router.navigate([`/${this.entry.type.toLowerCase()}s`]);
    }, error => alert(error));
  }

  goToLatestVersion() {
    return this.entryService.constructPath(this.entry.type, this.entry.id);
  }
}
