import {Component, Input, OnInit} from '@angular/core';

import {Comment} from "../../../model/comment.model";
import {CommentService} from "../../../services/comment.service";

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

  constructor(private commentService: CommentService) { }

  ngOnInit(): void {
    this.retrieveComments();
  }

  retrieveComments() {
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

  deleteCommentClick(comment: Comment) {
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

  formatDate(epoch: number) {
    return new Date(epoch).toLocaleString();
  }

}
