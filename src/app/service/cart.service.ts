import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from '../interceptors/auth.service';

export interface CartItem {
  productId:number;
  productName: string;
  productPrice: number;
  count: number;
  imageUrl:string|undefined;
}

export interface CartResponse {
  items: CartItem[];
  totalPrice: number;
  // productId:number;
  // count:number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient,private auth:AuthService) {}

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${environment.apiUrl}/${this.auth.getCurrentUserId()}`);
  }

  addToCart(productId: number, count: number): Observable<any> {
    const body = { productId, count };
    return this.http.post<any>(`${environment.apiUrl}/AddToCart/${this.auth.getCurrentUserId()}`, body);
  }


  increment(productId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/IncrementCount/${this.auth.getCurrentUserId()}/${productId}`, {});
  }

  decrement(productId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/DecrementCount/${this.auth.getCurrentUserId()}/${productId}`, {});
  }



  deleteItem(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteItem/${this.auth.getCurrentUserId()}/${productId}`);
  }



}
