// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports:[ReactiveFormsModule,NgIf],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  token: string = '';
  userId: string = '';
  error: string = '';
  success: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit() {
    if (this.form.valid) {
      const payload = {
        ...this.form.value,
        userId: this.userId,
        token: this.token
      };

      this.http.post(`${environment.apiBaseUrl}/Identity/Account/ConfirmResetPassword`, payload)
        .subscribe({
          next: () => {
            this.success = "Password reset successfully!";
            this.error = '';
            setTimeout(() => this.router.navigate(['/login']), 2000);
          },
          error: (err) => {
            this.error = err.error;
            this.success = '';
          }
        });
    }
  }
}
