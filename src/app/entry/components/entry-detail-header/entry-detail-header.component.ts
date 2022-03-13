import {Component, Input} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {Entry} from "@shared/models";
import {DeleteConfirmModalComponent} from "@shared/components";
import {EntryService} from "@app/entry/services/entry.service";

@Component({
  selector: 'lks-entry-detail-header',
  templateUrl: './entry-detail-header.component.html',
  styleUrls: ['./entry-detail-header.component.scss']
})
export class EntryDetailHeaderComponent {

  @Input()
  entry: Entry;

  @Input()
  previousVersion: boolean;

  constructor(private router: Router,
              private modalService: NgbModal,
              private entryService: EntryService) {
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
    service.delete(entry.id).subscribe(() => this.router.navigate(service.constructPath()));
  }

  goToLatestVersion() {
    return this.entryService.resolveService(this.entry.type)
      .constructPath(this.entry.id);
  }

  onStarClick() {
    this.entryService.star(this.entry.id, !this.entry.starred).subscribe(value => {
      this.entry = value;
    })
  }
}
