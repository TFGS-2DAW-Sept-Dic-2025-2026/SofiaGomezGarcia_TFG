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
    const footer = this.document.querySelector("footer") as HTMLElement;
    const wrapper = this.document.querySelector(".page-wrapper") as HTMLElement;

    if (!box || !footer || !wrapper) {
      console.error('Elementos no encontrados:', { box, footer, wrapper });
      return;
    }

    
    wrapper.style.position = 'relative';

    const margin = 20;
    const spacing = 20;
    const sidebarTop = 170;
    const sidebarHeight = window.innerHeight * 0.6;
    const fixedTop = sidebarTop + sidebarHeight + spacing;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const boxHeight = box.offsetHeight;
          const scrollY = window.scrollY;
          
          const footerOffsetTop = footer.offsetTop;
          
          const boxBottomIfFixed = scrollY + fixedTop + boxHeight;

          if (boxBottomIfFixed >= footerOffsetTop - margin) {
            if (box.style.position !== 'absolute') {
              box.style.position = 'absolute';
            }
            box.style.top = `${footerOffsetTop - boxHeight - margin}px`;
            box.style.left = '20px';
          } else {
           
            if (box.style.position !== 'fixed') {
              box.style.position = 'fixed';
            }
            box.style.top = `${fixedTop}px`;
            box.style.left = '20px';
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    handleScroll();
  }
}