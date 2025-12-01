import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
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

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngAfterViewInit() {
  if (!isPlatformBrowser(this.platformId)) return;

  const box = this.document.getElementById("sidebarUsuario") as HTMLElement;
  const sidebar = this.document.querySelector("aside.sidebar") as HTMLElement;
  const footer = this.document.querySelector("footer") as HTMLElement;

  if (!box || !sidebar || !footer) return;

  const margin = 20; // margen entre box y footer

  const handleScroll = () => {
    const sidebarRect = sidebar.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const scrollY = window.scrollY;

    const sidebarTop = sidebar.offsetTop; // top relativo al documento
    const sidebarHeight = sidebar.offsetHeight;
    const boxHeight = box.offsetHeight;

    // Top fijo debajo del sidebar
    const fixedTop = sidebarTop + sidebarHeight + margin;

    // Top máximo antes del footer
    const maxTop = footer.offsetTop - boxHeight - margin;

    if (scrollY + boxHeight + margin >= maxTop) {
      // Cuando llegamos al footer
      box.style.position = 'absolute';
      box.style.top = `${maxTop}px`;
    } else {
      // Fijo debajo del sidebar
      box.style.position = 'fixed';
      // top relativo al viewport
      const viewportTop = sidebarRect.bottom + margin;
      box.style.top = `${viewportTop}px`;
    }

    // Mantener alineado horizontalmente con el sidebar
    const sidebarLeft = sidebarRect.left + window.scrollX;
    box.style.left = `${sidebarLeft}px`;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll);

  // Ejecutar al cargar
  handleScroll();
}

}