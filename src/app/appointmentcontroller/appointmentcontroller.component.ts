import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

interface AppointmentResponse {
  appointmentId: number;
  userId: string;
  petId: number;
  vetId: string;
  dateTime: string;
  status: string;
  serviceId:number;
}

interface AppointmentRequest {
  userId: string;
  petId: number;
  vetId: string;
  dateTime?: string;
  status: string;
  serviceId:number;

}

interface UserResponse {
  id: string;
  userName: string;
  role: string; // Added role field
}

interface PetResponse {
  petId: number;
  name: string;
}

interface ServiceResponse {
  serviceId: number;
  name: string;
}

@Injectable()
class AppointmentService {
  private apiUrl = 'http://pethospital.runasp.net/Admin/Appointments';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<AppointmentResponse[]> {
    console.log('Fetching appointments from:', this.apiUrl);
    return this.http.get<AppointmentResponse[]>(this.apiUrl).pipe(
      tap(response => console.log('Appointments response:', response)),
      catchError(this.handleError)
    );
  }

  createAppointment(appointment: AppointmentRequest): Observable<AppointmentResponse> {
    console.log('Creating appointment at:', this.apiUrl, 'with data:', appointment);
    return this.http.post<AppointmentResponse>(this.apiUrl, appointment).pipe(
      tap(response => console.log('Create appointment response:', response)),
      catchError(this.handleError)
    );
  }

  updateAppointment(id: number, appointment: AppointmentRequest): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Updating appointment at:', url, 'with data:', appointment);
    return this.http.put<void>(url, appointment).pipe(
      tap(() => console.log('Update appointment response: No Content')),
      catchError(this.handleError)
    );
  }

  deleteAppointment(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Deleting appointment at:', url);
    return this.http.delete<void>(url).pipe(
      tap(() => console.log('Delete appointment response: No Content')),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API error:', error);
    let errorMessage = 'An error occurred. Please try again.';
    if (error.status === 404) {
      errorMessage = 'Endpoint not found. Check if the backend is running and the URL is correct (e.g., /Admin/Appointments).';
    } else if (error.status === 405) {
      errorMessage = 'Method not allowed. Ensure the backend supports this HTTP method.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Check if the backend is running at https://localhost:7202 and CORS is configured.';
    } else if (error.error?.Errors) {
      errorMessage = error.error.Errors.join(', ');
    }
    return throwError(() => new Error(errorMessage));
  }
}

@Injectable()
class UserService {
  private apiUrl = 'http://pethospital.runasp.net/Admin/Users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserResponse[]> {
    console.log('Fetching users from:', this.apiUrl);
    return this.http.get<UserResponse[]>(this.apiUrl).pipe(
      tap(response => console.log('Users response:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('User API error:', error);
    let errorMessage = 'Failed to load users. Please try again.';
    if (error.status === 404) {
      errorMessage = 'Users endpoint not found. Check if the backend is running and /Admin/Users is correct.';
    } else if (error.status === 405) {
      errorMessage = 'Method not allowed for /Admin/Users. Ensure the backend supports GET.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Check if the backend is running at https://localhost:7202 and CORS is configured.';
    }
    return throwError(() => new Error(errorMessage));
  }
}

@Injectable()
class PetService {
  private apiUrl = 'http://pethospital.runasp.net/Admin/Pets';

  constructor(private http: HttpClient) {}

  getPets(): Observable<PetResponse[]> {
    console.log('Fetching pets from:', this.apiUrl);
    return this.http.get<PetResponse[]>(this.apiUrl).pipe(
      tap(response => console.log('Pets response:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Pet API error:', error);
    let errorMessage = 'Failed to load pets. Please try again.';
    if (error.status === 404) {
      errorMessage = 'Pets endpoint not found. Check if the backend is running and /Admin/Pets is correct.';
    } else if (error.status === 405) {
      errorMessage = 'Method not allowed for /Admin/Pets. Ensure the backend supports GET.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Check if the backend is running at https://localhost:7202 and CORS is configured.';
    }
    return throwError(() => new Error(errorMessage));
  }
}

@Injectable()
class ServiceService {
  private apiUrl = 'http://pethospital.runasp.net/Admin/Services';

  constructor(private http: HttpClient) {}

  getServices(): Observable<ServiceResponse[]> {
    console.log('Fetching services from:', this.apiUrl);
    return this.http.get<ServiceResponse[]>(this.apiUrl).pipe(
      tap(response => console.log('Services response:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Service API error:', error);
    let errorMessage = 'Failed to load services. Please try again.';
    if (error.status === 404) {
      errorMessage = 'Services endpoint not found. Check if the backend is running and /Admin/Services is correct.';
    } else if (error.status === 405) {
      errorMessage = 'Method not allowed for /Admin/Services. Ensure the backend supports GET.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Check if the backend is running at https://localhost:7202 and CORS is configured.';
    }
    return throwError(() => new Error(errorMessage));
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  selector: 'app-appointmentcontroller',
  templateUrl: './appointmentcontroller.component.html',
  styleUrls: ['./appointmentcontroller.component.css'],
  providers: [
    {
      provide: AppointmentService,
      useFactory: (http: HttpClient) => new AppointmentService(http),
      deps: [HttpClient]
    },
    {
      provide: UserService,
      useFactory: (http: HttpClient) => new UserService(http),
      deps: [HttpClient]
    },
    {
      provide: PetService,
      useFactory: (http: HttpClient) => new PetService(http),
      deps: [HttpClient]
    },
    {
      provide: ServiceService,
      useFactory: (http: HttpClient) => new ServiceService(http),
      deps: [HttpClient]
    }
  ]
})
export class AppointmentcontrollerComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  users: UserResponse[] = [];
  pets: PetResponse[] = [];
  services: ServiceResponse[] = [];
  appointmentForm: FormGroup;
  editingAppointmentId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showForm: boolean = false;

  statuses: string[] = ['Pending', 'Confirmed', 'Cancelled'];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private petService: PetService,
    private serviceService: ServiceService
  ) {
    this.appointmentForm = this.fb.group({
      userId: ['', Validators.required],
      petId: ['', Validators.required],
      vetId: ['', Validators.required],
      serviceId: ['', Validators.required],
      dateTime: ['', Validators.required],
      status: ['Pending', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadUsers();
    this.loadPets();
    this.loadServices();
  }

  get vets(): UserResponse[] {
    const vets = this.users.filter(user => user.role === 'Vet');
    if (vets.length === 0 && this.users.length > 0) {
      console.warn('No users with role "vet" found in users:', this.users);
      this.errorMessage = 'No veterinarians available. Please add a user with role "vet".';
    }
    return vets;
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments || [];
        this.errorMessage = null;
        console.log('Appointments loaded:', this.appointments);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error loading appointments:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users || [];
        console.log('Users (including vets) loaded:', this.users);
        console.log('Filtered vets:', this.vets);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error loading users:', error);
      }
    });
  }

  loadPets(): void {
    this.petService.getPets().subscribe({
      next: (pets) => {
        this.pets = pets || [];
        console.log('Pets loaded:', this.pets);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error loading pets:', error);
      }
    });
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (services) => {
        this.services = services || [];
        console.log('Services loaded:', this.services);
      },
      error: (error) => {
        this.errorMessage = error.message;
        console.error('Error loading services:', error);
      }
    });
  }

  getUserName(userId: string): string {
    return this.users.find(u => u.id === userId)?.userName || userId;
  }

  getPetName(petId: number): string {
    return this.pets.find(p => p.petId === petId)?.name || petId.toString();
  }

  getVetName(vetId: string): string {
    return this.users.find(u => u.id === vetId)?.userName || vetId;
  }

  showCreateForm(): void {
    this.showForm = true;
    this.editingAppointmentId = null;
    this.appointmentForm.reset({ status: 'Pending' });
    this.errorMessage = null;
    this.successMessage = null;
  }

  editAppointment(appointment: AppointmentResponse): void {
    console.log('Editing appointment with ID:', appointment.appointmentId, 'Data:', appointment);
    this.editingAppointmentId = appointment.appointmentId;
    this.showForm = true;
    this.appointmentForm.patchValue({
      userId: appointment.userId,
      petId: appointment.petId,
      vetId: appointment.vetId,
      dateTime: new Date(appointment.dateTime).toISOString().slice(0, 16),
      status: appointment.status,
      serviceId:appointment.serviceId
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingAppointmentId = null;
    this.appointmentForm.reset({ status: 'Pending' });
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      console.log('Form invalid:', this.appointmentForm.errors);
      return;
    }

    const appointmentRequest: AppointmentRequest = {
      userId: this.appointmentForm.get('userId')?.value,
      petId: this.appointmentForm.get('petId')?.value,
      vetId: this.appointmentForm.get('vetId')?.value,
      dateTime: this.appointmentForm.get('dateTime')?.value,
      status: this.appointmentForm.get('status')?.value,
      serviceId:this.appointmentForm.get('serviceId')?.value
    };

    console.log('Request sent:', appointmentRequest);

    if (this.editingAppointmentId) {
      this.appointmentService.updateAppointment(this.editingAppointmentId, appointmentRequest).subscribe({
        next: () => {
          this.successMessage = 'Appointment updated successfully!';
          this.errorMessage = null;
          this.appointmentForm.reset({ status: 'Pending' });
          this.editingAppointmentId = null;
          this.showForm = false;
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.message;
          console.error('Error updating appointment:', error);
        }
      });
    } else {
      this.appointmentService.createAppointment(appointmentRequest).subscribe({
        next: (response) => {
          this.successMessage = 'Appointment created successfully!';
          this.errorMessage = null;
          this.appointmentForm.reset({ status: 'Pending' });
          this.editingAppointmentId = null;
          this.showForm = false;
          this.loadAppointments();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.message;
          console.error('Error creating appointment:', error);
        }
      });
    }
  }

  deleteAppointment(appointmentId: number): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentService.deleteAppointment(appointmentId).subscribe({
        next: () => {
          this.successMessage = 'Appointment deleted successfully!';
          this.errorMessage = null;
          this.loadAppointments();
        },
        error: (error) => {
          this.errorMessage = error.message;
          console.error('Error deleting appointment:', error);
        }
      });
    }
  }
}
