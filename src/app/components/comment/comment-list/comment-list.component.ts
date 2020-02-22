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

  showAddComment = false;

  constructor(private commentService: CommentService) { }

  ngOnInit(): void {
    this.commentService.getCommentsForEntry(this.entryId).subscribe(value => this.comments = value);
  }

  formatDate(epoch: number) {
    return new Date(epoch).toLocaleString();
  }

}
