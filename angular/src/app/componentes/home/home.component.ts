import { Component, HostListener, inject, OnInit } from '@angular/core';
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
  currentPage = 1;
  totalPages = 1;
  loading = false;

  currentSlide = 0;
  autoplaySub: Subscription | undefined;

  ngOnInit() {
    this.isLoggedIn = this.auth.hasValidSession();

    if (this.isLoggedIn) {
      this.resetAndLoadTopSeries();
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
}
