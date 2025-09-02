import { Component, NgModule, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm, NgModel, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { pipe } from 'rxjs';

interface Product {
  productId?: number;
  name: string;
  description?: string;
  price: number;
  categoryId?: number;
  stockQuantity: number;
  imageUrl?: string;
  traffic?:number;
  categoryName:string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  imports:[NgIf,ReactiveFormsModule,NgFor,FormsModule],
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: { categoryId: number, name: string }[] = [];

  isFormVisible = false;
  isEditMode = false;
  formData: any = {};
  selectedFile: File | null = null;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  private apiUrl = 'https://pethospital.runasp.net/Admin/Products';
  private categoriesUrl = 'https://pethospital.runasp.net/Admin/Categorys';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.products = data;
        this.errorMessage = null;
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.errorMessage = 'Failed to load products';
      }
    });
  }

  loadCategories(): void {
    this.http.get<{ categoryId: number, name: string }[]>(this.categoriesUrl).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed to load categories', err)
    });
  }
  getProductCategoryName(productcategoryId:number)
  {
    this.http.get<{ categoryId: number, name: string }[]>(this.categoriesUrl).subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed to load categories', err)
    });

  }

  openCreateForm(): void {
    this.isFormVisible = true;
    this.isEditMode = false;
    this.formData = { name: '', description: '', price: 0, categoryId: null, stockQuantity: 0, imageUrl: '',traffic:1 };
    this.selectedFile = null;
  }

  openEditForm(product: Product): void {
    this.isFormVisible = true;
    this.isEditMode = true;
    this.formData = { ...product };
    this.selectedFile = null;
  }

  cancelForm(): void {
    this.isFormVisible = false;
    this.isEditMode = false;
    this.formData = {};
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  getImageUrl(imageUrl: string | undefined): string {
    return imageUrl || '/images/default.jpg';
  }

  deleteProduct(id?: number): void {
    if (!id || !confirm('Are you sure you want to delete this product?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.successMessage = 'Product deleted successfully';
        this.loadProducts();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to delete product';
      }
    });
  }

  onSubmit(form?: NgForm): void {
    if (!this.formData) return;

    const formDataToSend = new FormData();

    formDataToSend.append('Name', this.formData.name || '');

    formDataToSend.append('Description', this.formData.description || '');

    formDataToSend.append('Price', (this.formData.price ?? 0).toString());

    formDataToSend.append('StockQuantity', (this.formData.stockQuantity ?? 0).toString());

    formDataToSend.append('traffic', (this.formData.traffic ?? 1).toString());

    if (this.formData.categoryId != null) {
      formDataToSend.append('CategoryId', this.formData.categoryId.toString());
    }

    if (this.formData.existingImageUrl) {
      formDataToSend.append('ExistingImageUrl', this.formData.existingImageUrl);
    }

    if (this.selectedFile) {
      formDataToSend.append('ImageFile', this.selectedFile);
    }

    if (this.isEditMode && this.formData.productId) {
      this.http.put(`${this.apiUrl}/${this.formData.productId}`, formDataToSend).subscribe({
        next: () => {
          this.successMessage = 'Product updated successfully';
          this.cancelForm();
          this.loadProducts();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.errorMessage = 'Failed to update product';
        }
      });
    } else {
      this.http.post(this.apiUrl, formDataToSend).subscribe({
        next: () => {
          this.successMessage = 'Product created successfully';
          this.cancelForm();
          this.loadProducts();
        },
        error: (err: HttpErrorResponse) => {
          console.error(err);
          this.errorMessage = 'Failed to create product';
        }
      });
    }
  }

}
