import { Component, OnInit } from '@angular/core';
import { CartService, UserCartSummary } from './cart.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-cart-list',
  templateUrl: './carts.component.html',
  imports:[NgIf,NgFor],
  styleUrls: ['./carts.component.css']
})
export class CartsComponent implements OnInit {
  userCarts: UserCartSummary[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCarts();
  }

  loadCarts() {
    this.isLoading = true;
    this.cartService.getUserCarts().subscribe({
      next: res => {
        this.userCarts = res;
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to load carts';
        this.isLoading = false;
      }
    });
  }

  deleteUserCart(userId: string) {
    if (!confirm('Are you sure you want to delete this user\'s cart?')) return;

    this.cartService.deleteUserCart(userId).subscribe({
      next: () => {
        this.userCarts = this.userCarts.filter(c => c.userId !== userId);
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Failed to delete cart';
      }
    });
  }
}
