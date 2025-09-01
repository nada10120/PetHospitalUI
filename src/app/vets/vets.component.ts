import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-vets',
  standalone: true,
  imports: [NgFor],
  templateUrl: './vets.component.html',
  styleUrls: ['./vets.component.css']
})
export class VetsComponent implements OnInit {
  vets: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/Customer/Details/GetVets`).subscribe({
      next: (res) => (this.vets = res),
      error: (err) => console.error(err),
    });
  }

  goToDetails(vetId: string) {
    this.router.navigate(['/vet-details', vetId]);
  }
}
