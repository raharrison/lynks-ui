import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Comment, NewComment} from "../../../model/comment.model";
import {CommentService} from "../../../services/comment.service";

@Component({
  selector: 'app-comment-edit',
  templateUrl: './comment-edit.component.html',
  styleUrls: ['./comment-edit.component.css']
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

  constructor(private commentService: CommentService) { }

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
    if (this.existingComment) {
      this.updateMode = true;
      this.newComment.id = this.existingComment.id;
      this.newComment.plainText = this.existingComment.plainText;
    } else {
      this.updateMode = false;
    }
  }

  onSubmit() {
    if(this.updateMode) {
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

}
