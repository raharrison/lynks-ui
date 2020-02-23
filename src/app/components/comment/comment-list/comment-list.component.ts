import {Component, Input, OnInit} from '@angular/core';

import {Comment} from "../../../model/comment.model";
import {CommentService} from "../../../services/comment.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent implements OnInit {

  @Input()
  entryId: string;

  comments: Comment[] = [];

  showEditor = false;

  selectedComment: Comment = null;

  private stagedDeleteComment: Comment = null;

  constructor(private commentService: CommentService,
              private modalService: NgbModal) { }

  ngOnInit(): void {
    this.retrieveComments();
  }

  private retrieveComments() {
    this.commentService.getCommentsForEntry(this.entryId).subscribe(value => this.comments = value);
  }

  addCommentClick() {
    this.showEditor = true;
    this.selectedComment = null;
  }

  editCommentClick(comment: Comment) {
    this.showEditor = true;
    this.selectedComment = comment;
  }

  openDeleteModal(content, comment) {
    this.stagedDeleteComment = comment;
    this.modalService.open(content).result.then(closeReason => {
      this.stagedDeleteComment = null;
      if(closeReason == "delete") {
        this.deleteComment(comment);
      }
    }, dismissReason => this.stagedDeleteComment = null);
  }

  private deleteComment(comment: Comment) {
    this.commentService.deleteComment(this.entryId, comment.id).subscribe(value => {
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
