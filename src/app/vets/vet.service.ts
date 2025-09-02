import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VetService {
  private apiUrl = 'https://pethospital.runasp.net/Customer/Details';

  constructor(private http: HttpClient) {}

  getVets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetVets`);
  }

  getVetDetails(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/GetVetDetails/${id}`);
  }
}
