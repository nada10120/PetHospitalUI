import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CommentResponse {
  commentId: number;
  content: string;
  userName?: string;
  postId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://pethospital.runasp.net/Admin/Comments';

  constructor(private http: HttpClient) { }

  getAll(): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(this.apiUrl);
  }

  delete(commentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${commentId}`);
  }
}
