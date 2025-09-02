import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem, CartResponse } from '../service/cart.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../interceptors/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number = 0;

  constructor(private http:HttpClient,private cartService: CartService, private auth:AuthService ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (res: CartResponse) => {
        this.cartItems = res.items;
        this.totalPrice = res.totalPrice;
      },
      error: (err: any) => console.error('Error loading cart:', err)
    });
  }

  increment(productId: number): void {
    this.cartService.increment(productId).subscribe(() => this.loadCart());
  }

  decrement(productId: number): void {
    this.cartService.decrement(productId).subscribe(() => this.loadCart());
  }

  delete(productId: number): void {
    this.cartService.deleteItem(productId).subscribe(() => this.loadCart());
  }
  checkout() {
    this.http.post<any>(`https://pethospital.runasp.net/api/Customer/Carts/CreateCheckoutSession/${this.auth.getCurrentUserId()}`, {})
      .subscribe(async res => {
        window.location.href = res.url; // Redirect to Stripe checkout
      });
  }


}
