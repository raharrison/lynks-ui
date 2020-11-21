import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Comment, NewComment} from "@app/comment/models";
import {CommentService} from "@app/comment/services/comment.service";

@Component({
  selector: 'lks-comment-edit',
  templateUrl: './comment-edit.component.html',
  styleUrls: ['./comment-edit.component.scss']
})
export class CommentEditComponent implements OnInit, OnChanges {

  @Input()
  entryId: string;

  @Input()
  existingComment: Comment;

  @Output()
  commentSaved = new EventEmitter<Comment>();

  newComment: NewComment;
  updateMode: boolean = false;
  saving: boolean = false;

  constructor(private commentService: CommentService) {
  }

  ngOnInit() {
    this.resetComment();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.resetComment();
  }

  resetComment() {
    this.newComment = {
      id: null,
      plainText: ""
    };
    this.saving = false;
    if (this.existingComment) {
      this.updateMode = true;
      this.newComment.id = this.existingComment.id;
      this.newComment.plainText = this.existingComment.plainText;
    } else {
      this.updateMode = false;
    }
  }

  onSubmit() {
    this.saving = true;
    if (this.updateMode) {
      this.commentService.updateComment(this.entryId, this.newComment).subscribe(value => {
        this.commentSaved.emit(value);
        this.resetComment();
      });
    } else {
      this.commentService.createComment(this.entryId, this.newComment).subscribe(value => {
        this.commentSaved.emit(value);
        this.resetComment();
      });
    }
  }

  onCancel() {
    this.commentSaved.emit(null);
  }

}
