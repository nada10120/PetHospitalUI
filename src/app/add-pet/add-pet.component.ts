import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../interceptors/auth.service'; // 🟢 Auth Service

interface Pet {
  petId: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  medicalHistory: string;
  profilePicture?: string;
  userId:string;
}

@Component({
  selector: 'app-pets',
  standalone: true,
  templateUrl: './add-pet.component.html',
  imports:[ReactiveFormsModule,NgFor,NgIf],
  styleUrls: ['./add-pet.component.css']
})
export class AddPetComponent implements OnInit {
  pets: Pet[] = [];
  petForm: FormGroup;
  editingPet: Pet | null = null;
  userId: string = "";

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService // 🟢 Inject AuthService
  ) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      breed: [''],
      age: ['', [Validators.required, Validators.min(0)]],
      medicalHistory: [''],
      profilePicture: [null]
    });
  }

  ngOnInit(): void {
    // 🟢 Get UserId from Auth Service (Decoded from token for example)
    this.userId = this.authService.getCurrentUserId()!;
    this.loadPets();
  }

  loadPets() {
    this.http.get<Pet[]>(`${environment.apiBaseUrl}/Admin/Pets/GetAllByUser/${this.userId}`).subscribe({
      next: (data) => this.pets = data,
      error: (err) => console.error('Error loading pets', err)
    });
  }

  submitForm() {
    if (this.petForm.invalid) return;

    const formData = new FormData();
    formData.append('UserId', this.userId); // 🟢 Add UserId automatically
    formData.append('Name', this.petForm.get('name')?.value);
    formData.append('Type', this.petForm.get('type')?.value);
    formData.append('Breed', this.petForm.get('breed')?.value || '');
    formData.append('Age', this.petForm.get('age')?.value);
    formData.append('MedicalHistory', this.petForm.get('medicalHistory')?.value || '');
    if (this.petForm.get('profilePicture')?.value) {
      formData.append('ProfilePicture', this.petForm.get('profilePicture')?.value);
    }

    if (this.editingPet) {
      // Update
      this.http.put(`${environment.apiBaseUrl}/Admin/Pets/${this.editingPet.petId}`, formData).subscribe({
        next: () => {
          this.loadPets();
          this.cancelEdit();
        },
        error: (err) => console.error('Error updating pet', err)
      });
    } else {
      // Create
      this.http.post(`${environment.apiBaseUrl}/Admin/Pets`, formData).subscribe({
        next: () => {
          this.loadPets();
          this.petForm.reset();
        },
        error: (err) => console.error('Error adding pet', err)
      });
    }
  }

  editPet(pet: Pet) {
    this.editingPet = pet;
    this.petForm.patchValue(pet);
  }

  cancelEdit() {
    this.editingPet = null;
    this.petForm.reset();
  }

  deletePet(id: number) {
    if (confirm('Are you sure you want to delete this pet?')) {
      this.http.delete(`${environment.apiBaseUrl}/Admin/Pets/${id}`).subscribe({
        next: () => this.loadPets(),
        error: (err) => console.error('Error deleting pet', err)
      });
    }
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.petForm.patchValue({ profilePicture: file });
    }
  }
}
