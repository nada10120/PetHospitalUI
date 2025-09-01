import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

interface CategoryResponse {
  categoryId: number;
  name: string;
}

interface CategoryRequest {
  name: string;
}

@Injectable()
class CategoryService {
  private apiUrl = 'http://pethospital.runasp.net/api/Admin/Categorys'; // Fixed to match CategorysController

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createCategory(category: CategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.apiUrl, category).pipe(
      catchError(this.handleError)
    );
  }

  updateCategory(id: number, category: CategoryRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, category).pipe(
      catchError(this.handleError)
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API error:', error);
    let errorMessage = 'An error occurred. Please try again.';
    if (error.status === 404) {
      errorMessage = 'Endpoint not found. Check if the backend is running and the URL is correct.';
    } else if (error.status === 405) {
      errorMessage = 'Method not allowed. Ensure the backend supports this HTTP method.';
    } else if (error.error?.Errors) {
      errorMessage = error.error.Errors.join(', ');
    }
    return throwError(() => new Error(errorMessage));
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  providers: [
    {
      provide: CategoryService,
      useFactory: (http: HttpClient) => new CategoryService(http),
      deps: [HttpClient]
    }
  ]
})
export class CategoriesComponent implements OnInit {
  categories: CategoryResponse[] = [];
  categoryForm: FormGroup;
  editingCategoryId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.errorMessage = null;
        console.log('Categories loaded:', categories);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error loading categories:', error);
      }
    });
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingCategoryId = null;
    this.categoryForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

  editCategory(category: CategoryResponse): void {
    console.log('Editing category with ID:', category.categoryId, 'Data:', category);
    this.editingCategoryId = category.categoryId;
    this.showForm = true;
    this.categoryForm.patchValue({
      name: category.name
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingCategoryId = null;
    this.categoryForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      console.log('Form invalid:', this.categoryForm.errors);
      return;
    }

    const categoryRequest: CategoryRequest = {
      name: this.categoryForm.get('name')?.value
    };

    console.log('Request sent:', categoryRequest);

    if (this.editingCategoryId) {
      this.categoryService.updateCategory(this.editingCategoryId, categoryRequest).subscribe({
        next: () => {
          console.log('Update response: No Content');
          this.successMessage = 'Category updated successfully!';
          this.errorMessage = null;
          this.categoryForm.reset();
          this.editingCategoryId = null;
          this.showForm = false;
          this.loadCategories();
        },
        error: (error: HttpErrorResponse) => {
          console.log('Error updating category:', error);
          this.errorMessage = error.message;
          console.error('Backend error details:', error.error);
        }
      });
    } else {
      this.categoryService.createCategory(categoryRequest).subscribe({
        next: (response) => {
          console.log('Create response:', response);
          this.successMessage = 'Category created successfully!';
          this.errorMessage = null;
          this.categoryForm.reset();
          this.editingCategoryId = null;
          this.showForm = false;
          this.loadCategories();
        },
        error: (error: HttpErrorResponse) => {
          console.log('Error creating category:', error);
          this.errorMessage = error.message;
          console.error('Backend error details:', error.error);
        }
      });
    }

    console.log('Sending', this.editingCategoryId ? 'PUT' : 'POST', 'request to', this.editingCategoryId ? `http://pethospital.runasp.net/api/Admin/Categorys/${this.editingCategoryId}` : 'http://pethospital.runasp.net/api/Admin/Categorys');
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          this.successMessage = 'Category deleted successfully!';
          this.errorMessage = null;
          this.loadCategories();
        },
        error: (error) => {
          this.errorMessage = error.message;
          console.error('Error deleting category:', error);
        }
      });
    }
  }
}
