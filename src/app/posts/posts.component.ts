import { Component, OnInit } from '@angular/core';
import { PostService, PostResponse } from './post.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  imports:[NgIf,NgFor],
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {

  posts: PostResponse[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    this.postService.getAll().subscribe({
      next: (res) => {
        this.posts = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load posts';
        this.isLoading = false;
      }
    });
  }

  deletePost(postId: number) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    this.postService.delete(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.postId !== postId);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to delete post';
      }
    });
  }
}
