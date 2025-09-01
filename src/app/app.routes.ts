import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { CommunityComponent } from './community/community.component';
import { ReservationComponent } from './reservation/reservation.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { StoreComponent } from './store/store.component';
import { RegisterComponent } from './register/register.component';
import { PetsComponent } from './pets/pets.component';
import { ServiceComponent } from './service/service.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductsComponent } from './products/products.component';
import { CategoriesComponent } from './categories/categories.component';
import { UsersComponent } from './users/users.component';
import { AppointmentcontrollerComponent } from './appointmentcontroller/appointmentcontroller.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { CartComponent } from './cart/cart.component';
import { AddPetComponent } from './add-pet/add-pet.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminGuard } from './interceptors/admin.guard';
import { PostsComponent } from './posts/posts.component';
import { CommentsComponent } from './comments/comments.component';
import { CartsComponent } from './carts/carts.component';
import { SuccessComponent } from './success/success.component';
import { FailedComponent } from './failed/failed.component';
import { VetsComponent } from './vets/vets.component';
import { VetDetailsComponent } from './vet-details/vet-details.component';
import { ServicesDetailsComponent } from './services-details/services-details.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'community', component: CommunityComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'store', component: StoreComponent },
  { path: 'store/details/:id', component: ProductDetailsComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'service', component: ServiceComponent },
  { path: 'cart', component: CartComponent },
  { path: 'addpet', component: AddPetComponent },
  { path: 'forgotpassword', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'success', component: SuccessComponent },
  { path: 'failed', component: FailedComponent },
  { path: 'vets', component: VetsComponent },
  { path: 'vet-details/:id', component: VetDetailsComponent },
  { path: 'services-details', component: ServicesDetailsComponent },

  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'users', component: UsersComponent },
      { path: 'appointments', component: AppointmentcontrollerComponent },
      { path: 'pets', component: PetsComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'posts', component: PostsComponent },
      { path: 'comments', component: CommentsComponent },
      { path: 'carts', component: CartsComponent },
      { path: 'service', component: ServiceComponent }
    ]
  },

  { path: '**', component: PagenotfoundComponent }
];
