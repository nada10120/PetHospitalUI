// reservation.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../interceptors/auth.service';

interface Vet {
  vetId: string;
  name: string;
}

interface Pet {
  petId: number;
  name: string;
}
interface Services{
serviceId:number;
name:string;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  reservationForm!: FormGroup;
  vets: Vet[] = [];
  pets: Pet[] = [];
  services:Services[]=[];
  timeSlots: string[] = [];
  minDate: string = new Date().toISOString().split('T')[0]; // يمنع الايام القديمة

  private apiUrl = 'https://pethospital.runasp.net/Customer/Reservation';

  constructor(private fb: FormBuilder, private http: HttpClient,private authservice:AuthService) {}

  ngOnInit(): void {
    this.reservationForm = this.fb.group({
      vetId: ['', Validators.required],
      petId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      serviceId: [1] // مؤقت، تقدر تجيب الخدمات لو عايز
    });

    this.loadVets();
    this.loadPets();
    this.loadServices();
    this.generateTimeSlots();
  }

  loadVets() {
    this.http.get<any[]>(`${this.apiUrl}/GetAllVets`).subscribe({
      next: (data) => (this.vets = data),
      error: (err) => console.error(err),
    });
  }

  loadPets() {
    this.http.get<any[]>(`https://pethospital.runasp.net/Admin/Pets/GetAllByUser/${this.authservice.getCurrentUserId()}`).subscribe({
      next: (data) => (this.pets = data),
      error: (err) => console.error(err),
    });
  }
  loadServices(){
    this.http.get<any[]>(`https://pethospital.runasp.net/Admin/Services`).subscribe(
      {
        next: (data) => (this.services = data),
        error: (err) => console.error(err),
      }
    )
  }

  // توليد المواعيد من 10 ص لحد 10 م كل 30 دقيقة
  generateTimeSlots() {
    const start = 10;
    const end = 22;
    for (let hour = start; hour < end; hour++) {
      this.timeSlots.push(`${hour}:00`);
      this.timeSlots.push(`${hour}:30`);
    }
  }

  // التحقق من الأيام (من الأحد لـ الخميس)
  isValidDate(selectedDate: string): boolean {
    const date = new Date(selectedDate);
    const day = date.getDay(); // 0=أحد .. 6=سبت
    return day >= 0 && day <= 4; // الأحد (0) لحد الخميس (4)
  }

  onSubmit() {
    if (this.reservationForm.invalid) return;

    const { vetId, petId, date, time, serviceId } = this.reservationForm.value;
    if (!this.isValidDate(date)) {
      alert('الحجز مسموح فقط من الأحد للخميس');
      return;
    }

    const appointmentDate = new Date(`${date}T${time}:00`);

    const reservation = {
      vetId,
      petId: Number(petId),
      userId: this.authservice.getCurrentUserId(), // هتحط الـ userId من التوكن أو الـ state
      serviceId,
      dateTime: appointmentDate,
      status: "Pending"
    };

    this.http.post(`https://pethospital.runasp.net/Admin/Appointments`, reservation).subscribe({
      next: () => alert('تم الحجز بنجاح 🎉'),
      error: (err) => alert('خطأ في الحجز ❌ ' + err.message),
    });
  }
}
