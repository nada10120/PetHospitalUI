import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-vet-details',
  standalone: true,
  imports: [NgIf],
  templateUrl: './vet-details.component.html',
  styleUrls: ['./vet-details.component.css']
})
export class VetDetailsComponent implements OnInit {
  vet: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const vetId = this.route.snapshot.paramMap.get('id');
    if (vetId) {
      this.http.get<any>(`${environment.apiBaseUrl}/Customer/Details/GetVetDetails/${vetId}`).subscribe({
        next: (res) => (this.vet = res),
        error: (err) => console.error(err),
      });
    }
  }

  bookNow() {
    this.router.navigate(['/reservation']);
  }
}
