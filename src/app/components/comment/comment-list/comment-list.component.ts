import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {Comment} from "../../../model/comment.model";
import {CommentService} from "../../../services/comment.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DeleteConfirmModalComponent} from "../../utils/delete-confirm-modal/delete-confirm-modal.component";

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit {

  @Input()
  entryId: string;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  comments: Comment[] = [];

  showEditor = false;
  loading = true;

  selectedComment: Comment = null;

  constructor(private commentService: CommentService,
              private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.retrieveComments();
  }

  private retrieveComments() {
    this.commentService.getCommentsForEntry(this.entryId).subscribe(value => {
      this.comments = value;
      this.loading = false;
      this.onLoaded.emit(this.comments.length);
    });
  }

  addCommentClick() {
    this.showEditor = true;
    this.selectedComment = null;
  }

  editCommentClick(comment: Comment) {
    this.showEditor = true;
    this.selectedComment = comment;
  }

  openDeleteModal(comment) {
    const modalRef = this.modalService.open(DeleteConfirmModalComponent);
    modalRef.componentInstance.data = comment;
    modalRef.componentInstance.type = "comment";

    modalRef.result.then(closeData => {
      if (closeData) {
        this.deleteComment(closeData);
      }
    }, () => {
    });
  }

  private deleteComment(comment: Comment) {
    this.commentService.deleteComment(this.entryId, comment.id).subscribe(() => {
      this.selectedComment = null;
      this.retrieveComments();
    });
  }

  onCommentSaved(comment: Comment) {
    this.selectedComment = null;
    this.showEditor = false;
    if (comment != null) {
      this.retrieveComments();
    }
  }

}
