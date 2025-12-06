import { Component, HostListener, Inject, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
auth = inject(AuthService);

  get usuario() {
    return this.auth.getDatosUsuario();
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  

}
