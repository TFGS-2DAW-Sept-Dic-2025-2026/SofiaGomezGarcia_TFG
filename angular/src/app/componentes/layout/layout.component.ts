import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  auth = inject(AuthService);


   get usuario() {
    return this.auth.getDatosUsuario();
  }

}