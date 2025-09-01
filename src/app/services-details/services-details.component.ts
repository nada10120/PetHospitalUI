import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';

interface Service {
  serviceId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-services-details',
  templateUrl: './services-details.component.html',
  imports:[NgIf,NgFor,CurrencyPipe,CommonModule],
  styleUrls: ['./services-details.component.css']
})
export class ServicesDetailsComponent implements OnInit {
  services: Service[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<Service[]>(`${environment.apiBaseUrl}/Customer/Details/GetServices`)
      .subscribe({
        next: (data) => {
          this.services = data;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Failed to load services.';
          this.isLoading = false;
        }
      });
  }

  bookAppointment(serviceId: number) {
    this.router.navigate(['/reservation']);
  }
}
