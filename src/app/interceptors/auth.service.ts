// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {}
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) {
      console.log('getCurrentUserId: No token found');
      return null;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      if (!userId) {
        console.log('getCurrentUserId: nameidentifier claim not found in token');
      }
      return userId || null;
    } catch (error) {
      console.log('getCurrentUserId: Error parsing token:', error);
      return null;
    }
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // لو فيه توكن يبقى logged in
  }
  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      
      const roles = payload['role'] || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      if (!roles) return false;

      // لو فيه أكتر من role هيكون array، لو واحد بس هيكون string
      if (Array.isArray(roles)) {
        return roles.includes('Admin');
      } else {
        return roles === 'Admin';
      }
    } catch (error) {
      console.error('isAdmin: Error parsing token:', error);
      return false;
    }
  }

  getUserName(): string | null {
    return localStorage.getItem('userName'); // أو أي key إنت حاطط فيه الاسم
  }
  logout(): Observable<any> {
    return this.http.post(`${environment.authUrl}/Logout`, {});
  }


}
