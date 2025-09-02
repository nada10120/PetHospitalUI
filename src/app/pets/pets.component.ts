import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

interface PetResponse {
  petId: number;
  userId: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  medicalHistory: string;
  profilePicture: string;
}

interface UserResponse {
  id: string;
  userName: string;
}

@Injectable()
class PetService {
  private apiUrl = 'https://pethospital.runasp.net/api/Admin/Pets';

  constructor(private http: HttpClient) {}

  getPets(): Observable<PetResponse[]> {
    return this.http.get<PetResponse[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createPet(formData: FormData): Observable<PetResponse> {
    return this.http.post<PetResponse>(this.apiUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  updatePet(id: number, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData).pipe(
      catchError(this.handleError)
    );
  }

  deletePet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API error:', error);
    return throwError(() => error);
  }
}

@Injectable()
class UserService {
  private apiUrl = 'https://pethospital.runasp.net/api/Admin/Users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('User API error:', error);
    return throwError(() => error);
  }
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  selector: 'app-pets',
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.css'],
  providers: [
    {
      provide: PetService,
      useFactory: (http: HttpClient) => new PetService(http),
      deps: [HttpClient]
    },
    {
      provide: UserService,
      useFactory: (http: HttpClient) => new UserService(http),
      deps: [HttpClient]
    }
  ]
})
export class PetsComponent implements OnInit {
  pets: PetResponse[] = [];
  users: UserResponse[] = [];
  petForm: FormGroup;
  selectedFile: File | null = null;
  editingPetId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showForm: boolean = false;

  breeds: string[] = [
    'Persian', 'Maine Coon', 'Siamese',
    'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
    'Parakeet', 'Cockatiel',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private petService: PetService,
    private userService: UserService
  ) {
    this.petForm = this.fb.group({
      userId: ['', Validators.required],
      name: ['', Validators.required],
      type: ['', Validators.required],
      breed: [''],
      age: [0, [Validators.min(0)]],
      medicalHistory: [''],
      profilePicture: ['']
    });
  }

  ngOnInit(): void {
    this.loadPets();
    this.loadUsers();
  }

  loadPets(): void {
    this.petService.getPets().subscribe({
      next: (pets) => {
        this.pets = pets;
        this.errorMessage = null;
        console.log('Pets loaded:', pets);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load pets. Please try again.';
        console.error('Error loading pets:', error);
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Users loaded:', users);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load users. Please try again.';
        console.error('Error loading users:', error);
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
    this.editingPetId = null;
    this.petForm.reset();
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  editPet(pet: PetResponse): void {
    console.log('Editing pet with ID:', pet.petId, 'FormData:', pet);
    this.editingPetId = pet.petId;
    this.showForm = true;
    this.petForm.patchValue({
      userId: pet.userId,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      medicalHistory: pet.medicalHistory,
      profilePicture: pet.profilePicture
    });
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingPetId = null;
    this.petForm.reset();
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      console.log('Form invalid:', this.petForm.errors);
      return;
    }

    const formData = new FormData();
    formData.append('UserId', this.petForm.get('userId')?.value);
    formData.append('Name', this.petForm.get('name')?.value);
    formData.append('Type', this.petForm.get('type')?.value);
    formData.append('Breed', this.petForm.get('breed')?.value || '');
    formData.append('Age', this.petForm.get('age')?.value.toString());
    formData.append('MedicalHistory', this.petForm.get('medicalHistory')?.value || '');

    if (this.selectedFile) {
      formData.append('ProfilePicture', this.selectedFile, this.selectedFile.name);
    } else if (this.editingPetId) {
      formData.append('ExistingProfilePicture', this.petForm.get('profilePicture')?.value || '');
    }

    console.log('FormData sent:', Array.from(formData.entries()));

    const request = this.editingPetId
      ? this.petService.updatePet(this.editingPetId, formData)
      : this.petService.createPet(formData);

    console.log('Sending', this.editingPetId ? 'PUT' : 'POST', 'request to', this.editingPetId ? `https://pethospital.runasp.net/api/Admin/Pets/${this.editingPetId}` : 'https://pethospital.runasp.net/api/Admin/Pets');

    request.subscribe({

      next: (response) => {
        console.log(this.editingPetId ? 'Update response:' : 'Create response:', response);
        this.successMessage = this.editingPetId ? 'Pet updated successfully!' : 'Pet created successfully!';
        this.errorMessage = null;
        this.petForm.reset();
        this.selectedFile = null;
        this.editingPetId = null;
        this.showForm = false;
        this.loadPets();
      },
      error: (error: HttpErrorResponse) => {
        console.log('Error', this.editingPetId ? 'updating' : 'creating', 'pet:', error);
        this.errorMessage = error.error?.Errors ? error.error.Errors.join(', ') : 'An error occurred. Please try again.';
        console.error('Backend error details:', error.error);
      }
    });
  }

  deletePet(petId: number): void {
    if (confirm('Are you sure you want to delete this pet?')) {
      this.petService.deletePet(petId).subscribe({
        next: () => {
          this.successMessage = 'Pet deleted successfully!';
          this.errorMessage = null;
          this.loadPets();
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete pet. Please try again.';
          console.error('Error deleting pet:', error);
        }
      });
    }
  }
}
