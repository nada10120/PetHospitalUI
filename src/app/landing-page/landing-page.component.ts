import { Component } from '@angular/core';
import { HeroComponent } from "../hero/hero.component";
import { ServicesComponent } from "../services/services.component";
import { TestmonialsComponent } from "../testmonials/testmonials.component";
import { ContactComponent } from "../contact/contact.component";

@Component({
  selector: 'app-landing-page',
  imports: [HeroComponent, ServicesComponent, TestmonialsComponent, ContactComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {

}
