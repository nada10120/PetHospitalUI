import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface DashboardResponse {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  totalVets: number;
  totalUsers: number;
  totalAppointments: number;
  totalPets: number;
  totalPosts: number;
  totalComments: number;
  totalCarts: number;
  totalservices:number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardResponse = {
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    totalVets: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalPets: 0,
    totalPosts: 0,
    totalComments: 0,
    totalCarts: 0,
    totalservices:0
  };

  errorMessage: string | null = null;
  successMessage: string | null = null;

  private apiUrl = 'http://pethospital.runasp.net/Admin/Dashboard';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    console.log('Fetching dashboard data from:', this.apiUrl);
    this.http.get<DashboardResponse>(this.apiUrl).subscribe({
      next: (data) => {
        this.dashboardData = data || {
          totalProducts: 0,
          totalCategories: 0,
          lowStockProducts: 0,
          totalVets: 0,
          totalUsers: 0,
          totalAppointments: 0,
           totalPosts:0,
           totalComments:0,
          totalCarts:0,
          totalPets:0,
          totalservices:0
        };
        this.errorMessage = null;
        this.successMessage = 'Dashboard data loaded successfully!';
        console.log('Dashboard data loaded:', this.dashboardData);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading dashboard data:', err);
        this.errorMessage = this.handleError(err);
        this.successMessage = null;
      }
    });
  }

  navigateTo(route: string): void {
    console.log(`Navigating to /admin/${route}`);
    this.router.navigate([`/admin/${route}`]);
  }

  private handleError(error: HttpErrorResponse): string {
    console.error('API error:', error);
    let errorMessage = 'An error occurred. Please try again.';
    if (error.status === 400) {
      if (error.error?.Errors && Object.keys(error.error.Errors).length > 0) {
        errorMessage = Object.entries(error.error.Errors)
          .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
          .join('; ');
      } else if (error.error?.title) {
        errorMessage = error.error.title;
      } else {
        errorMessage = 'Validation error occurred, but no specific details provided by the server.';
      }
    } else if (error.status === 404) {
      errorMessage = 'Dashboard endpoint not found. Check if the backend is running and /Admin/Dashboard is correct.';
    } else if (error.status === 405) {
      errorMessage = 'Method not allowed. Ensure the backend supports GET for /Admin/Dashboard.';
    } else if (error.status === 0) {
      errorMessage = 'Network error. Check if the backend is running at https://localhost:7202, CORS is configured, and HTTPS certificate is trusted.';
    } else if (error.error?.Message) {
      errorMessage = error.error.Message;
    }
    return errorMessage;
  }
}
