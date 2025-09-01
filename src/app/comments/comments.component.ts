import { Component, OnInit } from '@angular/core';
import { CommentService, CommentResponse } from './comment.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comments.component.html',
  imports:[NgFor,NgIf],
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  comments: CommentResponse[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private commentService: CommentService) { }

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments() {
    this.isLoading = true;
    this.commentService.getAll().subscribe({
      next: (res) => {
        this.comments = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load comments';
        this.isLoading = false;
      }
    });
  }

  deleteComment(commentId: number) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.commentService.delete(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.commentId !== commentId);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to delete comment';
      }
    });
  }
}
