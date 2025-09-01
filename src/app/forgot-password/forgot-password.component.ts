// forgot-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports:[ReactiveFormsModule,NgIf],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message: string = '';
  error: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      emailOrUserName: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      this.http.post(`${environment.apiBaseUrl}/Identity/Account/ForgetPassword`, this.form.value)
      .subscribe({
        next: (res: any) => {
          this.message = res.message || res;   
          this.error = '';
        },
        error: (err) => {
          this.error = err.error?.message || err.error || "Something went wrong!";
          this.message = '';
        }
      });

    }
  }
}
