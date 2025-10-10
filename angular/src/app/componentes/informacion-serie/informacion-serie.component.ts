import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { seriesService } from '../../servicios/series.service';
import { AuthService } from '../../servicios/auth.service';
import { FavoritesService } from '../../servicios/favorites.service';
import { ListasService } from '../../servicios/listas.service';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-informacion-serie',
  standalone: true,
  imports: [RouterModule, CommonModule,LayoutComponent],
  templateUrl: './informacion-serie.component.html',
  styleUrls: ['./informacion-serie.component.css'],
})
export class InformacionSerieComponent implements OnInit {
  auth = inject(AuthService);
  seriesService = inject(seriesService);
  favoritesService = inject(FavoritesService);
  listasService = inject(ListasService);

  serie: any;
  isFavorite = false;
  showListMenu = false;
  listasUsuario: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.seriesService.getSeriesByID(id).subscribe({
        next: (data) => {
          this.serie = data;
          this.checkIfFavorite(id);
        },
        error: (err) => console.error('Error cargando la serie:', err),
      });
    }
  }

  private checkIfFavorite(serieId: string) {
    if (!this.auth.hasValidSession()) return; 

    this.favoritesService.getFavorites().subscribe({
      next: (res) => {
        const favoritas = res.favoritas || res;
        this.isFavorite = favoritas.includes(serieId);
      },
      error: (err) => console.error('Error obteniendo favoritas:', err),
    });
  }

  toggleFavorite() {
    if (!this.auth.hasValidSession()) return; 
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.favoritesService.toggleFavorite(id).subscribe({
      next: (res) => {
        this.isFavorite = res.favoritas.includes(id);
      },
      error: (err) => console.error('Error al agregar/quitar favorito:', err),
    });
  }

  
  toggleListMenu() {
    if (!this.showListMenu) {
      this.obtenerListasUsuario();
    }
    this.showListMenu = !this.showListMenu;
  }

  
  obtenerListasUsuario() {
    this.listasService.getListas().subscribe({
      next: (res) => {
        this.listasUsuario = res;
      },
      error: (err) => console.error('Error al obtener las listas:', err),
    });
  }

  
  agregarSerieALista(idLista: string) {
    if (!this.serie?._id && !this.serie?.id) return;
    const idSerie = this.serie._id || this.serie.id;

    this.listasService.agregarSerieALista(idLista, idSerie).subscribe({
      next: () => {
        console.log(`Serie añadida correctamente a la lista`); //cambiar por un mensaje en el html
        this.showListMenu = false;
      },
      error: (err) => console.error('Error al añadir serie a la lista:', err),
    });
  }


}