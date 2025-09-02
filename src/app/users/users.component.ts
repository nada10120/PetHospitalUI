import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';

interface UserResponse {
  id: string;
  email: string;
  userName: string;
  address: string;
  profilePicture: string | null;
  role: string;
  emailConfirmed: boolean;
  petCount: number;
  appointmentCount: number;
  orderCount: number;
  postCount: number;
  commentCount: number;
  likeCount: number;
}

interface UserRequest {
  id?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  userName: string;
  address?: string;
  role: string;
  specialization?: string;
  availabilitySchedule?: string;
  profilePicture?: string | null;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  users: UserResponse[] = [];
  formData: UserRequest = { email: '', userName: '', address: '', role: '', specialization: '', availabilitySchedule: '', password: '', confirmPassword: '', profilePicture: null };
  isFormVisible = false;
  isEditMode = false;
  currentUserId: string | null = null;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  private apiUrl = 'http://pethospital.runasp.net/Admin/Users';
  private defaultProfilePicture = '/assets/images/default-profile.png';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('Fetching users from:', this.apiUrl);
    this.http.get<UserResponse[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.users = data || [];
        this.errorMessage = null;
        console.log('Users loaded:', this.users);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading users:', err);
        this.errorMessage = this.handleError(err);
      },
    });
  }

  getProfilePictureUrl(fileName: string | null): string {
    return fileName ? `http://pethospital.runasp.net/images/profile/${fileName}` : this.defaultProfilePicture;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultProfilePicture;
  }

  openCreateForm(): void {
    this.formData = { email: '', password: '', confirmPassword: '', userName: '', address: '', role: '', specialization: '', availabilitySchedule: '', profilePicture: null };
    this.isFormVisible = true;
    this.isEditMode = false;
    this.currentUserId = null;
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  async openEditForm(user: UserResponse): Promise<void> {
    const vetDetails = user.role === 'Vet' ? await this.getVetDetails(user.id) : null;
    this.formData = {
      id: user.id,
      email: user.email || '',
      userName: user.userName || '',
      address: user.address || '',
      role: user.role || '',
      profilePicture: user.profilePicture || null,
      specialization: vetDetails?.specialization || '',
      availabilitySchedule: vetDetails?.availabilitySchedule || '',
      password: '',
      confirmPassword: ''
    };
    this.isFormVisible = true;
    this.isEditMode = true;
    this.currentUserId = user.id;
    this.errorMessage = null;
    this.successMessage = null;
    console.log('Editing user with ID:', this.currentUserId, 'FormData:', this.formData);
  }

  private async getVetDetails(userId: string): Promise<{ specialization: string; availabilitySchedule: string } | null> {
    try {
      const vetDetails = await lastValueFrom(this.http.get<{ specialization: string; availabilitySchedule: string }>(`http://pethospital.runasp.net/Vets/${userId}`));
      console.log('Vet details fetched for user:', userId, vetDetails);
      return vetDetails || null;
    } catch (err) {
      console.error('Failed to fetch vet details:', err);
      this.errorMessage = 'Failed to fetch vet details. Please try again.';
      return null;
    }
  }

  cancelForm(): void {
    this.isFormVisible = false;
    this.formData = { email: '', userName: '', address: '', role: '', specialization: '', availabilitySchedule: '', password: '', confirmPassword: '', profilePicture: null };
    this.currentUserId = null;
    this.selectedFile = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    console.log('Selected file:', this.selectedFile ? this.selectedFile.name : 'None');
  }

  onRoleChange(): void {
    if (this.formData.role !== 'Vet') {
      this.formData.specialization = '';
      this.formData.availabilitySchedule = '';
    }
  }

  onSubmit(): void {
    if (!this.formData.email || !this.formData.userName || !this.formData.role) {
      this.errorMessage = 'Email, Username, and Role are required.';
      console.error('Form validation failed:', this.formData);
      return;
    }

    if (!this.isEditMode && (!this.formData.password || this.formData.password !== this.formData.confirmPassword)) {
      this.errorMessage = 'Password is required and must match Confirm Password for new users.';
      console.error('Password validation failed:', this.formData);
      return;
    }

    if (this.formData.password && !this.isStrongPassword(this.formData.password)) {
      this.errorMessage = 'Password must be at least 8 characters, including a number, uppercase, lowercase, and special character.';
      console.error('Password strength validation failed:', this.formData.password);
      return;
    }

    const formDataToSend = new FormData();
    if (this.isEditMode && this.currentUserId) {
      formDataToSend.append('Id', this.currentUserId);
    }
    formDataToSend.append('Email', this.formData.email);
    formDataToSend.append('UserName', this.formData.userName);
    formDataToSend.append('Address', this.formData.address || 'Default Address');
    formDataToSend.append('Role', this.formData.role);
    if (this.formData.password) {
      formDataToSend.append('Password', this.formData.password);
    }
    if (this.formData.role === 'Vet') {
      formDataToSend.append('Specialization', this.formData.specialization || 'General');
      formDataToSend.append('AvailabilitySchedule', this.formData.availabilitySchedule || 'N/A');
    }
    if (this.selectedFile) {
      formDataToSend.append('ProfilePicture', this.selectedFile);
    } else if (this.isEditMode && this.formData.profilePicture) {
      formDataToSend.append('ExistingProfilePicture', this.formData.profilePicture);
    }

    const formDataEntries = Array.from(formDataToSend.entries()).map(([key, value]) => `${key}: ${value instanceof File ? value.name : value}`);
    console.log('FormData sent:', JSON.stringify(formDataEntries, null, 2));

    if (this.isEditMode && this.currentUserId) {
      console.log(`Sending PUT request to ${this.apiUrl}/${this.currentUserId}`);
      this.http.put(`${this.apiUrl}/${this.currentUserId}`, formDataToSend).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.successMessage = 'User updated successfully!';
          this.errorMessage = null;
          this.loadUsers();
          this.cancelForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.handleError(err);
          console.error('Error updating user:', err);
        },
      });
    } else {
      console.log(`Sending POST request to ${this.apiUrl}`);
      this.http.post(this.apiUrl, formDataToSend).subscribe({
        next: (response) => {
          console.log('Create response:', response);
          this.successMessage = 'User created successfully!';
          this.errorMessage = null;
          this.loadUsers();
          this.cancelForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.handleError(err);
          console.error('Error creating user:', err);
        },
      });
    }
  }

  private handleError(error: HttpErrorResponse): string {
    console.error('API error:', error);
    let errorMessage = 'An error occurred. Please try again.';
    if (error.status === 404) {
      errorMessage = 'Endpoint not found. Check if the backend is running and /Admin/Users is correct.';
    } else if (error.status === 405) {
      errorMessage = 'Method not allowed. Ensure the backend supports this HTTP method.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Check if the backend is running at https://localhost:7202, CORS is configured, and HTTPS certificate is trusted.';
    } else if (error.error?.Errors) {
      errorMessage = error.error.Errors.join(', ');
    } else if (error.error?.Message) {
      errorMessage = error.error.Message;
    }
    return errorMessage;
  }

  private isStrongPassword(password: string): boolean {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  }

  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${this.apiUrl}/${userId}`).subscribe({
        next: () => {
          this.successMessage = 'User deleted successfully!';
          this.errorMessage = null;
          this.loadUsers();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = this.handleError(err);
          console.error('Error deleting user:', err);
        },
      });
    }
  }
}
