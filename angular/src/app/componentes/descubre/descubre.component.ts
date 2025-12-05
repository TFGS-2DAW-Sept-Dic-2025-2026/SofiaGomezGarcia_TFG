import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { AuthService } from '../../servicios/auth.service';
import { seriesService } from '../../servicios/series.service';




@Component({
  selector: 'app-descubre',
  imports: [FormsModule, CommonModule, RouterModule, LayoutComponent],
  templateUrl: './descubre.component.html',
  styleUrl: './descubre.component.css'
})
export class DescubreComponent {
  auth = inject(AuthService);
  servicioSeries = inject(seriesService);

  series: any[] = [];
  generos: any[] = [];
  plataformas: any[] = [];
  idiomas = [
    { iso: 'es', name: 'Español' },
    { iso: 'en', name: 'Inglés' },
    { iso: 'fr', name: 'Francés' },
    { iso: 'de', name: 'Alemán' },
    { iso: 'ja', name: 'Japonés' },
  ];

  filtros = {
    query: '',
    genero: '',
    idioma: '',
    plataforma: '',
  };

  loading = false;
  currentPage = 1;
  totalPages = 1;

  ngOnInit(): void {
    this.cargarFiltros();
    this.buscarSeries();
  }

  cargarFiltros() {
    // Géneros
    this.servicioSeries.getGeneros().subscribe({
      next: (res) => (this.generos = res.genres),
      error: (err) => console.error('Error al cargar géneros:', err),
    });

    // Plataformas
    this.servicioSeries.getProveedores().subscribe({
      next: (res) => (this.plataformas = res.results),
      error: (err) => console.error('Error al cargar plataformas:', err),
    });
  }

  buscarSeries(reset: boolean = false) {
    if (this.loading) return;

    if (reset) {
      this.series = [];
      this.currentPage = 1;
    }

    this.loading = true;

    const filtrosConPagina = { ...this.filtros, page: this.currentPage };

    this.servicioSeries.buscarSeries(filtrosConPagina).subscribe({
      next: (res) => {
        this.series.push(...res.results);
        this.totalPages = res.total_pages;
        this.loading = false;
        this.currentPage++;
      },
      error: (err) => {
        console.error('Error al buscar series:', err);
        this.loading = false;
      },
    });
  }

  @HostListener('window:scroll', [])
onScroll(): void {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 100) {
    if (this.currentPage <= this.totalPages) {
      this.buscarSeries();
    }
  }
}
}