import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { seriesService } from '../../servicios/series.service';
import { FavoritesService } from '../../servicios/favorites.service';
import { forkJoin } from 'rxjs';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-favoritas',
  imports: [RouterModule, CommonModule,LayoutComponent],
  templateUrl: './favoritas.component.html',
  styleUrl: './favoritas.component.css'
})
export class FavoritasComponent implements OnInit {
  auth = inject(AuthService);
  seriesService = inject(seriesService);
  favoritesService = inject(FavoritesService);

  series: any[] = [];
  loading = true;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.auth.hasValidSession()) {
      this.loadFavoritas();
    }
  }

  loadFavoritas() {
    this.favoritesService.getFavorites().subscribe({
      next: (res: any) => {
        const favoritas: string[] = res.favoritas || [];
        const requests = favoritas.map(id => this.seriesService.getSeriesByID(id));

        forkJoin(requests).subscribe({
          next: (results) => {
            this.series = results;
            this.loading = false;
            console.log('Series favoritas cargadas:', this.series);
          },
          error: (err) => {
            console.error('Error cargando series favoritas:', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error obteniendo favoritas:', err);
        this.loading = false;
      }
    });
  }
}