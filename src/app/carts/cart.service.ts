import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserCartSummary {
  userId: string;
  userName: string;
  productsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://pethospital.runasp.net/api/Admin/Carts';

  constructor(private http: HttpClient) { }

  getUserCarts(): Observable<UserCartSummary[]> {
    return this.http.get<UserCartSummary[]>(`${this.apiUrl}/UserCarts`);
  }

  deleteUserCart(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
