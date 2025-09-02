import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostResponse {
  postId: number;
  userId: string;
  userName: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  likesCount?: number;
  commentsCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'https://pethospital.runasp.net/api/Admin/Post';

  constructor(private http: HttpClient) { }

  getAll(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(this.apiUrl);
  }

  delete(postId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${postId}`);
  }
}
