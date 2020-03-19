import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {LinkService} from "../../../../services/link.service";
import {Link} from "../../../../model/link.model";
import {DeleteConfirmModalComponent} from "../../../utils/delete-confirm-modal/delete-confirm-modal.component";

@Component({
  selector: 'app-link-detail',
  templateUrl: './link-detail.component.html',
  styleUrls: ['./link-detail.component.css']
})
export class LinkDetailComponent implements OnInit {

  id;
  link: Link;
  loading = true;
  isContentCollapsed = true;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private modalService: NgbModal,
              private linkService: LinkService) {
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id");
    this.linkService.getLink(this.id).subscribe((data) => {
      this.link = data;
      this.loading = false;
    });
  }

  openDeleteModal() {
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.data = this.link;
    modalRef.componentInstance.type = "link";

    modalRef.result.then(closeData => {
      if (closeData) {
        this.deleteLink(closeData);
      }
    }, () => {
    });
  }

  private deleteLink(link: Link) {
    this.linkService.deleteLink(link.id).subscribe(() => {
      this.router.navigate(["/notes"]);
    }, error => alert(error));
  }

}
