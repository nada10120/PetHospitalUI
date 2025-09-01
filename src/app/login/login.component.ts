import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { RouterLink } from '@angular/router';


interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userId: string;
  role: string;
  userName?:string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule,RouterLink],
  template: `
    <div class="container">
      <h2>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" formControlName="email" id="email" class="form-control" />
          <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="error">
            Valid email is required.
          </div>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" formControlName="password" id="password" class="form-control" />
          <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error">
            Password is required.
          </div>
        </div>
        <button type="submit" [disabled]="loginForm.invalid" class="btn btn-primary">Login</button>
      </form>
      <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>
      <p *ngIf="successMessage" class="success">{{ successMessage }}</p>
        <a routerLink="/forgotpassword">Did you Forget Your Password?</a>
    </div>

    <style>
      .container {
        max-width: 400px;
        margin: 20px auto;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        font-family: Arial, sans-serif;
      }
      h2 {
        text-align: center;
        color: #333;
        margin-bottom: 20px;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        color: #555;
        font-weight: 500;
      }
      .form-control {
        width: 100%;
        padding: 10px;
        font-size: 16px;
        color: #333;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
      .form-control:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
      }
      .btn {
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-primary {
        background-color: #007bff;
        color: #fff;
      }
      .btn-primary:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
      .error {
        color: #dc3545;
        font-size: 14px;
        margin-top: 5px;
      }
      .success {
        color: #28a745;
        font-size: 14px;
        margin-top: 10px;
        text-align: center;
      }
    </style>
  `,
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please enter a valid email and password.';
      return;
    }

    const loginRequest: LoginRequest = this.loginForm.value;

    this.http.post<LoginResponse>(`${environment.authUrl}/login`, loginRequest).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (!response.userId || response.userId === 'undefined') {
          throw new Error('Invalid userId received from server.');
        }
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('role', response.role);
          if (response.userName) {
            localStorage.setItem('userName', response.userName);
          }
          console.log('Stored in localStorage:', {
            token: response.token,
            userId: response.userId,
            role: response.role
          });
        }
        this.successMessage = 'Login successful!';
        this.errorMessage = null;
        this.router.navigate(['']);
      }),
      catchError(error => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.successMessage = null;
        return throwError(() => error);
      })
    ).subscribe();
  }
}
