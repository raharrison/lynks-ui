import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DeleteConfirmModalComponent} from "@shared/components";
import {Comment} from '@app/comment/models';
import {CommentService} from "@app/comment/services/comment.service";
import {SortConfig, SortDirection} from "@shared/models/sort-config.model";
import {LoadingStatus} from "@shared/models/loading-status.model";

@Component({
  selector: 'lks-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit {

  readonly SORT_CONFIGS: SortConfig[] = [
    {name: "Oldest First", sort: "dateCreated", direction: SortDirection.ASC},
    {name: "Newest First", sort: "dateCreated", direction: SortDirection.DESC}
  ];

  private sortConfig = this.SORT_CONFIGS[0];

  @Input()
  entryId: string;

  @Output()
  onLoaded: EventEmitter<number> = new EventEmitter<number>();

  comments: Comment[] = [];

  showEditor = false;
  loadingStatus: LoadingStatus = LoadingStatus.LOADING;

  selectedComment: Comment = null;

  constructor(private commentService: CommentService,
              private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.retrieveComments();
  }

  private retrieveComments() {
    this.loadingStatus = LoadingStatus.LOADING;
    this.commentService.getCommentsForEntry(this.entryId, this.sortConfig).subscribe({
      next: page => {
        this.comments = page.content;
        this.loadingStatus = LoadingStatus.LOADED;
        this.onLoaded.emit(this.comments.length);
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }

  applySort(config: SortConfig) {
    this.sortConfig = config;
    this.retrieveComments();
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
