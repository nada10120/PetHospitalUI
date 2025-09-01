import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../interceptors/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface Post {
  postId: number;
  userId: string;
  userName: string;
  content: string;
  mediaUrl?: string | null;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
}

interface Comment {
  commentId: number;
  postId: number;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export class CommunityComponent implements OnInit {
  posts: Post[] = [];
  newPostContent: string = '';
  newPostMedia: File | null = null;
  comments: { [key: number]: Comment[] } = {};
  commentInputs: { [key: number]: string } = {};
  isLoading: boolean = false;
  errorMessage: string = '';
  private apiUrl = 'https://localhost:7202/api/Customer/Community';
  private postUrl='https://localhost:7202/api/Admin/Post';
  private commentUrl='https://localhost:7202/api/Admin/Comments';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      console.log('ngOnInit: Not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    this.loadPosts();
  }

  private handleError(error: HttpErrorResponse) {
    console.log('Error details:', error); // Log full error
    this.errorMessage = error.error?.Message || error.error || 'Something went wrong';
    this.isLoading = false;
    if (error.status === 401) {
      console.log('401 Unauthorized, logging out and redirecting to login');
      this.authService.logout();
      this.router.navigate(['/login']);
    } else if (error.status === 400) {
      console.log('400 BadRequest:', this.errorMessage);
      // Display error message, do not redirect
    }
    return throwError(() => new Error(this.errorMessage));
  }

  async loadPosts() {
    this.isLoading = true;
    this.http.get<Post[]>(`${this.apiUrl}/GetAllPosts`)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: (res) => {
          this.posts = res;
          
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.newPostMedia = input.files[0];
    }
  }

  async createPost() {
    if (!this.authService.isLoggedIn()) {
      console.log('createPost: Not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.newPostContent.trim()) {
      this.errorMessage = 'Post content is required';
      return;
    }
    if (this.newPostContent.length > 1000) {
      this.errorMessage = 'Post content is too long';
      return;
    }
    const userId = this.authService.getCurrentUserId();
    console.log('createPost - UserId:', userId, 'Token:', this.authService.getToken());
    if (!userId) {
      this.errorMessage = 'Please login to create a post';
      console.log('createPost: UserId is null, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    formData.append('UserId', userId);
    formData.append('Content', this.newPostContent);
    if (this.newPostMedia) {
      formData.append('MediaUrl', this.newPostMedia);
    }
    this.http.post(`${this.postUrl}/Create`, formData)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: () => {
          this.newPostContent = '';
          this.newPostMedia = null;
          this.errorMessage = '';
          this.loadPosts();
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }



  async loadComments(postId: number) {
    if (!this.authService.isLoggedIn()) {
      console.log('loadComments: Not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    this.isLoading = true;
    this.http.get<Comment[]>(`${this.apiUrl}/GetComments/${postId}`)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: (res) => {
          this.comments[postId] = res;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  async addComment(postId: number) {
    if (!this.authService.isLoggedIn()) {
      console.log('addComment: Not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    const content = this.commentInputs[postId]?.trim();
    if (!content) {
      this.errorMessage = 'Comment content is required';
      return;
    }
    if (content.length > 500) {
      this.errorMessage = 'Comment is too long';
      return;
    }
    const userId = this.authService.getCurrentUserId();
    console.log('addComment - UserId:', userId, 'PostId:', postId, 'Content:', content);
    if (!userId) {
      this.errorMessage = 'Please login to comment';
      console.log('addComment: UserId is null, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    this.isLoading = true;
    // Use PascalCase property names to match CommentRequest DTO
    const payload = {
      UserId: userId,
      Content: content,
      PostId: postId
    };
    this.http.post(`${this.commentUrl}/Create`, payload)
      .pipe(catchError(this.handleError.bind(this)))
      .subscribe({
        next: () => {
          const post = this.posts.find(p => p.postId === postId);
          if (post) {
            post.commentsCount += 1;
          }
          this.commentInputs[postId] = '';
          this.loadComments(postId);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
}
