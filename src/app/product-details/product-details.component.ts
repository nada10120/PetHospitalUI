import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService,CartItem,CartResponse } from '../service/cart.service';

interface Product {
  productId: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

interface ProductDetailsResponse {
  product: Product;
  relatedProducts: Product[];
  sameCategoryProducts: Product[];
  topProducts: Product[];
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-details.component.html',
  styles: []
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  sameCategoryProducts: Product[] = [];
  topProducts: Product[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute, private cartService: CartService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProductDetails(+id);
    }
  }

  loadProductDetails(id: number) {
    this.http.get<ProductDetailsResponse>(`http://pethospital.runasp.net/Customer/ECommerces/${id}`)
      .subscribe({
        next: (response) => {
          this.product = {
            ...response.product,
            imageUrl: response.product.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'
          };
          this.relatedProducts = response.relatedProducts.map(p => ({
            ...p,
            imageUrl: p.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'
          }));
          this.sameCategoryProducts = response.sameCategoryProducts.map(p => ({
            ...p,
            imageUrl: p.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'
          }));
          this.topProducts = response.topProducts.map(p => ({
            ...p,
            imageUrl: p.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'
          }));
          console.log('Product Details:', this.product); // Debug image URL
        },
        error: (error) => console.error('Error loading product details:', error)
      });
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
