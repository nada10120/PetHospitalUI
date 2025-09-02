import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../interceptors/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

interface Appointment {
  appointmentId: number;
  vetId: string;
  vetName: string;
  petId: number;
  petName: string;
  serviceId: number;
  serviceName: string;
  appointmentDate: string;
  status: string;
  userId: string;
}

interface Vet {
  vetId: string;
  name: string;
}

interface Pet {
  petId: number;
  name: string;
}

interface Service {
  serviceId: number;
  name: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  editForm!: FormGroup;
  editingAppointment: Appointment | null = null;

  vets: Vet[] = [];
  pets: Pet[] = [];
  services: Service[] = [];

  private apiUrl = 'https://pethospital.runasp.net/api/Customer/Reservation';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadDropdownData();

    this.editForm = this.fb.group({
      vetId: [''],
      petId: [''],
      serviceId: [''],
      appointmentDate: ['']
    });
  }

  loadAppointments() {
    this.http.get<Appointment[]>(`${this.apiUrl}/GetAllReservations`).subscribe({
      next: (data) => {
        const currentUserId = this.authService.getCurrentUserId();
        this.appointments = data.filter(a => a.userId === currentUserId);
      },
      error: (err) => console.error(err)
    });
  }

  loadDropdownData() {
    this.http.get<Vet[]>('https://pethospital.runasp.net/api/Customer/Reservation/GetAllVets').subscribe(v => this.vets = v);
    this.http.get<Pet[]>('https://pethospital.runasp.net/api/Admin/Pets').subscribe(p => this.pets = p);
    this.http.get<Service[]>('https://pethospital.runasp.net/api/Admin/Services').subscribe(s => this.services = s);
  }

  startEdit(appointment: Appointment) {
    this.editingAppointment = appointment;
    this.editForm.patchValue({
      vetId: appointment.vetId,
      petId: appointment.petId,
      serviceId: appointment.serviceId,
      appointmentDate: appointment.appointmentDate.split('T')[0]
    });
  }

  cancelEdit() {
    this.editingAppointment = null;
    this.editForm.reset();
  }

  saveEdit() {
    if (!this.editingAppointment) return;

    const updated: any = {
      userId: this.editingAppointment.userId,
      petId: Number(this.editForm.value.petId),
      vetId: this.editForm.value.vetId,
      serviceId: Number(this.editForm.value.serviceId),
      status: this.editingAppointment.status,
      dateTime: new Date(this.editForm.value.appointmentDate).toISOString()
    };

    console.log('🚀 Sending to API:', updated);

    this.http.put(
      `${this.apiUrl}/UpdateReservation/${this.editingAppointment.appointmentId}`,
      updated   // ✅ ابعتها مباشرة
    ).subscribe({
      next: () => {
        alert('تم تعديل الحجز ✅');
        this.loadAppointments();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('❌ Error response:', err);
        alert('خطأ أثناء تعديل الحجز ❌ ' + err.message);
      }
    });
  }



  deleteAppointment(id: number) {
    if (!confirm('هل أنت متأكد أنك تريد إلغاء هذا الحجز؟')) return;

    this.http.delete(`${this.apiUrl}/DeleteReservation/${id}`).subscribe({
      next: () => {
        alert('تم إلغاء الحجز 🗑');
        this.loadAppointments();
      },
      error: (err) => alert('خطأ أثناء الحذف ❌ ' + err.message)
    });
  }
}
