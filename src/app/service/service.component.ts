import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

interface ServiceResponse {
  serviceId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

@Injectable()
class ServiceService {
  private apiUrl = 'https://pethospital.runasp.net/Admin/Services';

  constructor(private http: HttpClient) {}

  getServices(): Observable<ServiceResponse[]> {
    return this.http.get<ServiceResponse[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createService(formData: FormData): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  updateService(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API error:', error);
    return throwError(() => error);
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css'],
  providers: [
    {
      provide: ServiceService,
      useFactory: (http: HttpClient) => new ServiceService(http),
      deps: [HttpClient]
    }
  ]
})
export class ServiceComponent implements OnInit {
  services: ServiceResponse[] = [];
  serviceForm: FormGroup;
  selectedFile: File | null = null;
  editingServiceId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['']
    });
  }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (services) => {
        this.services = services;
        this.errorMessage = null;
        console.log('Services loaded:', services);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load services. Please try again.';
        console.error('Error loading services:', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile.name);
    } else {
      this.selectedFile = null;
    }
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingServiceId = null;
    this.serviceForm.reset();
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  editService(service: ServiceResponse): void {
    console.log('Editing service with ID:', service.serviceId, 'FormData:', service);
    this.editingServiceId = service.serviceId;
    this.showForm = true;
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description,
      price: service.price,
      imageUrl: service.imageUrl
    });
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingServiceId = null;
    this.serviceForm.reset();
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      console.log('Form invalid:', this.serviceForm.errors);
      return;
    }

    const formData = new FormData();
    formData.append('Name', this.serviceForm.get('name')?.value);
    formData.append('Description', this.serviceForm.get('description')?.value);
    formData.append('Price', this.serviceForm.get('price')?.value.toString());

    if (this.selectedFile) {
      formData.append('ImageUrl', this.selectedFile, this.selectedFile.name);
    } else if (this.editingServiceId) {
      formData.append('ImageUrl', this.serviceForm.get('imageUrl')?.value || 'default-service.png');
    }

    console.log('FormData sent:', Array.from(formData.entries()));

    const request = this.editingServiceId
      ? this.serviceService.updateService(this.editingServiceId, formData)
      : this.serviceService.createService(formData);

    console.log('Sending', this.editingServiceId ? 'PUT' : 'POST', 'request to', this.editingServiceId ? `https://pethospital.runasp.net/Admin/Services/${this.editingServiceId}` : 'https://pethospital.runasp.net/Admin/Services');

    request.subscribe({
      next: (response) => {
        console.log(this.editingServiceId ? 'Update response:' : 'Create response:', response);
        this.successMessage = this.editingServiceId ? 'Service updated successfully!' : 'Service created successfully!';
        this.errorMessage = null;
        this.serviceForm.reset();
        this.selectedFile = null;
        this.editingServiceId = null;
        this.showForm = false;
        this.loadServices();
      },
      error: (error: HttpErrorResponse) => {
        console.log('Error', this.editingServiceId ? 'updating' : 'creating', 'service:', error);
        this.errorMessage = error.error?.Errors ? error.error.Errors.join(', ') : 'An error occurred. Please try again.';
        console.error('Backend error details:', error.error);
      }
    });
  }

  deleteService(serviceId: number): void {
    if (confirm('Are you sure you want to delete this service?')) {
      this.serviceService.deleteService(serviceId).subscribe({
        next: () => {
          this.successMessage = 'Service deleted successfully!';
          this.errorMessage = null;
          this.loadServices();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete service. Please try again.';
          console.error('Error deleting service:', error);
        }
      });
    }
  }
}
