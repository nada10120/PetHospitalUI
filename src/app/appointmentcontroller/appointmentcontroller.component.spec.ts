import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentcontrollerComponent } from './appointmentcontroller.component';

describe('AppointmentcontrollerComponent', () => {
  let component: AppointmentcontrollerComponent;
  let fixture: ComponentFixture<AppointmentcontrollerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentcontrollerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentcontrollerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
