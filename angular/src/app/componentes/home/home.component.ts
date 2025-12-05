import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';
import { seriesService } from '../../servicios/series.service';
import { LayoutComponent } from '../layout/layout.component';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, LayoutComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  servicioSeries = inject(seriesService);

  isLoggedIn = false;

  series: any[] = [];
  tendencias: any[] = [];
  currentPage = 1;
  totalPages = 1;
  loading = false;
  cardsPerView = 0;

  currentSlide = 0;
  autoplaySub: Subscription | undefined;

  ngOnInit() {
    this.isLoggedIn = this.auth.hasValidSession();

    this.cargarPopulares();  // ← AÑADIDO

    if (this.isLoggedIn) {
      this.resetAndLoadTopSeries();
      this.cargarTendencias();
    } else {
      this.cargarSoloPrimeraPagina();
    }
  }

  // =========================
  // CARGA DE SERIES
  // =========================
  resetAndLoadTopSeries() {
    this.series = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.loadSeries();
  }

  cargarTendencias() {
    this.servicioSeries.getTrending().subscribe({
      next: (res) => {
        this.tendencias = res.results.slice(0, 20);
      },
      error: (err) => console.error("Error cargando tendencias", err)
    });
  }

  loadSeries() {
    if (!this.isLoggedIn) return;
    if (this.loading || this.currentPage > this.totalPages) return;

    this.loading = true;

    this.servicioSeries.getSeries(this.currentPage).subscribe({
      next: (res) => {
        this.series.push(...res.results);
        this.totalPages = res.total_pages;
        this.currentPage++;
        this.loading = false;


        if (this.series.length > 0 && !this.autoplaySub) {
          this.startAutoplay();
        }
      },
      error: (err) => {
        console.error('Error cargando series:', err);
        this.loading = false;
      }
    });
  }

  cargarSoloPrimeraPagina() {
    this.loading = true;

    this.servicioSeries.getSeries(1).subscribe({
      next: (res) => {
        this.series = res.results;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando series iniciales:', err);
        this.loading = false;
      }
    });
  }

  // =========================
  // SCROLL INFINITO
  // =========================
  @HostListener('window:scroll', [])
  onScroll(): void {
    if (!this.isLoggedIn) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      this.loadSeries();
    }
  }

  // =========================
  // CARRUSEL
  // =========================
  startAutoplay() {
    this.autoplaySub = timer(5000, 5000).subscribe(() => {
      this.nextSlide();
    });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % Math.min(this.series.length, 3);
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + Math.min(this.series.length, 3)) %
      Math.min(this.series.length, 3);
  }

  ngOnDestroy() {
    if (this.autoplaySub) {
      this.autoplaySub.unsubscribe();
    }
  }


  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollTendencias', { read: ElementRef }) scrollTendencias!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollPopulares', { read: ElementRef }) scrollPopulares!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollDescubre', { read: ElementRef }) scrollDescubre!: ElementRef<HTMLDivElement>;

  scrollLeft() {
    this.scrollContainer.nativeElement.scrollBy({
      left: -250,
      behavior: 'smooth'
    });
  }

  scrollRight() {
    this.scrollContainer.nativeElement.scrollBy({
      left: 250,
      behavior: 'smooth'
    });
  }


  scrollHorizontal(
  section: 'tendencias' | 'populares' | 'descubre',
  direction: 'left' | 'right',
  distance: number = 300
) {
  let element: HTMLElement;

  switch (section) {
    case 'tendencias':
      element = this.scrollTendencias.nativeElement;
      break;
    case 'populares':
      element = this.scrollPopulares.nativeElement;
      break;
    case 'descubre':
      element = this.scrollDescubre.nativeElement;
      break;
    default:
      return; // sección no válida
  }

  const amount = direction === 'left' ? -distance : distance;
  element.scrollBy({ left: amount, behavior: 'smooth' });
}




  // =========================
  // Populares
  // =========================

  populares: any[] = [];

  cargarPopulares() {
    this.servicioSeries.getPopular().subscribe({
      next: res => this.populares = res,
      error: err => console.error("Error populares", err)
    });
  }





}
