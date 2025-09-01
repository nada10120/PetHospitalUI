import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  formData: any = {
    Email: '',
    Password: '',
    UserName: '',
    Address: '',
    Role: 'Client', // تلقائي Client
  };

  confirmPassword: string = '';
  passwordsDoNotMatch: boolean = false;
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.formData.Password !== this.confirmPassword) {
      this.passwordsDoNotMatch = true;
      return;
    } else {
      this.passwordsDoNotMatch = false;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('Email', this.formData.Email);
    formDataToSend.append('Password', this.formData.Password);
    formDataToSend.append('UserName', this.formData.UserName);
    formDataToSend.append('Address', this.formData.Address || '');
    formDataToSend.append('Role', this.formData.Role);

    if (this.selectedFile) {
      formDataToSend.append('ProfilePicture', this.selectedFile);
    }

    this.http.post('https://localhost:7202/api/Identity/Account/Register', formDataToSend)
      .subscribe({
        next: (res) => {
          console.log('Success', res);
          alert('Account created successfully! Please check your email to confirm.');
        },
        error: (err) => {
          console.error('Error', err);
          if (err.error && err.error.length) {
            alert('Failed: ' + err.error.map((e: any) => e.description).join(', '));
          } else {
            alert('Failed to create account.');
          }
        }
      });
  }
}
