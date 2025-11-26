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


  //Metodo para calcular la posicion del footer y colocar el contenedor del perfil
  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const box = this.document.getElementById("sidebarUsuario");
    const initialTop = 170 + window.innerHeight * 0.6 + 20; // posición inicial

    if (!box) return;

    const handleScroll = () => {
      const footer = this.document.querySelector("footer");
      if (!footer) return;

      const boxHeight = box.offsetHeight;

      // Calcula la posición del footer dinámicamente
      const footerOffsetTop = footer.getBoundingClientRect().top + window.scrollY;

      const scrollY = window.scrollY;
      const maxTop = footerOffsetTop - boxHeight - 20; // 20px margen antes del footer

      if (scrollY + initialTop >= maxTop) {
        box.style.position = "absolute";
        box.style.top = `${maxTop}px`;
      } else {
        box.style.position = "fixed";
        box.style.top = `${initialTop}px`;
      }
    };

    // Ejecutar en scroll y al cargar
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); 
    setTimeout(handleScroll, 100); 
  }
}