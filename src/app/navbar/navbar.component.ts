import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../interceptors/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink,NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    constructor(public authService: AuthService, private router: Router) {}

    logout(): void {
      this.authService.logout().subscribe({
        next: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('role');
          localStorage.removeItem('userName');
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Logout error:', err);
        }
      });
    }


}
