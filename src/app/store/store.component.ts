import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService,CartItem,CartResponse } from '../service/cart.service';
interface Product {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface Category {
  categoryId: number;
  name: string;
}

interface FilterItemsRequest {
  productName?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  search?: string;
}

interface StoreResponse {
  products: Product[];
  categories: Category[];
  filterItemsVM: FilterItemsRequest;
  totalPageNumber: number;
}

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './store.component.html',
  styles: []
})
export class StoreComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  filters: FilterItemsRequest = {};
  currentPage = 1;
  totalPages = 1;
  pagesArray: number[] = [];

  constructor(private http: HttpClient,private cartService:CartService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    const params = { ...this.filters, page: this.currentPage };
    this.http.get<StoreResponse>('http://pethospital.runasp.net/Customer/ECommerces/index', { params })
      .subscribe({
        next: (response) => {
          this.products = response.products.map(product => ({
            ...product,
            imageUrl: product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'
          }));
          this.categories = response.categories;
          this.totalPages = response.totalPageNumber;
          this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
          console.log('Products:', this.products); // Debug image URLs
        },
        error: (error) => console.error('Error loading products:', error)
      });
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadProducts();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  addToCart(product: Product) {
    const cartItem: CartItem = {

      productId: product.productId,
      productName: product.name,
      productPrice: product.price,
      count: 1,
      imageUrl: product.imageUrl
    };

    this.cartService.addToCart(cartItem.productId, cartItem.count).subscribe({
      next: (response: CartResponse) => {
        console.log('Item added to cart successfully:', response);
        alert(`${product.name} was added to your cart!`);
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        alert('Something went wrong while adding to cart.');
      }
    });
  }

}
