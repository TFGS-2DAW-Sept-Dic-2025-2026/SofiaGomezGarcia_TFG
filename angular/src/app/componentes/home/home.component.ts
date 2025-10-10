import { Component, effect, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';
import { seriesService } from '../../servicios/series.service';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, LayoutComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  auth = inject(AuthService);
  servicioSeries = inject(seriesService);

  isLoggedIn = false;
  series: any[] = [];
  currentPage = 1;
  totalPages = 1;
  loading = false;

  constructor() {
    // Inicializa solo si ya hay sesión válida
    if (this.auth.hasValidSession()) {
      this.loadSeries();
    }

    // efecto reactivo: se ejecuta en contexto de inyección
    effect(() => {
      this.isLoggedIn = this.auth.hasValidSession();
      if (this.isLoggedIn) {
        this.loadSeries();
      }
    });
  }

  loadSeries() {
    if (this.loading || this.currentPage > this.totalPages) return;

    this.loading = true;
    this.servicioSeries.getSeries(this.currentPage).subscribe({
      next: (res) => {
        this.series.push(...res.results);
        this.totalPages = res.total_pages;
        this.currentPage++;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando series:', err);
        this.loading = false;
      }
    });
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      this.loadSeries();
    }
  }
}