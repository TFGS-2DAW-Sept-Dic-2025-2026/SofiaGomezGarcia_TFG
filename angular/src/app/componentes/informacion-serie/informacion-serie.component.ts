import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { seriesService } from '../../servicios/series.service';
import { AuthService } from '../../servicios/auth.service';
import { FavoritesService } from '../../servicios/favorites.service';
import { ListasService } from '../../servicios/listas.service';
import { LayoutComponent } from '../layout/layout.component';
import { SeguimientoService } from '../../servicios/seguimiento.service';
import { OpinionSerieComponent } from './opinion-serie/opinion-serie.component';

@Component({
  selector: 'app-informacion-serie',
  standalone: true,
  imports: [RouterModule, CommonModule, LayoutComponent, OpinionSerieComponent],
  templateUrl: './informacion-serie.component.html',
  styleUrls: ['./informacion-serie.component.css'],
})
export class InformacionSerieComponent implements OnInit {

  auth = inject(AuthService);
  seriesService = inject(seriesService);
  favoritesService = inject(FavoritesService);
  listasService = inject(ListasService);
  seguimientoService = inject(SeguimientoService);

  private sanitizer = inject(DomSanitizer);

  serie: any;
  isFavorite = false;
  isFollowing = false;

  mostrarTrailer = false;
  youtubeKey: string | null = null;
  youtubeURL!: SafeResourceUrl | null;

  listasUsuario: any[] = [];
  showListMenu = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.seriesService.getSeriesByID(id).subscribe({
        next: (data) => {
          this.serie = data;
          this.checkIfFavorite(id);
          this.checkIfFollowing(this.serie.id || this.serie._id);
        },
        error: (err) => console.error('Error cargando la serie:', err),
      });
    }
  }

  // ---------- FAVORITOS ----------
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

  // ---------- LISTAS ----------
  mostrarModalListas = false;
  listasUsuarioConEstado: any[] = [];

  abrirModalListas() {
    if (!this.auth.hasValidSession() || !this.serie) return;

    const idSerie = this.serie._id || this.serie.id;

    this.listasService.getListasConEstado(idSerie).subscribe({
      next: (listas) => {
        this.listasUsuarioConEstado = listas;
        this.mostrarModalListas = true;
      },
      error: (err) => console.error('Error al obtener listas con estado:', err)
    });
  }

  agregarSerieALista(idLista: string) {
    if (!this.serie?._id && !this.serie?.id) return;
    const idSerie = this.serie._id || this.serie.id;

    this.listasService.agregarSerieALista(idLista, idSerie).subscribe({
      next: () => {
        this.listasUsuarioConEstado = this.listasUsuarioConEstado.map(lista => {
          if (lista._id === idLista) {
            return {
              ...lista,
              series: [...lista.series, idSerie],
              contieneSerie: true
            };
          }
          return lista;
        });
      },
      error: (err) => console.error('Error al añadir serie a la lista:', err),
    });
  }

  cerrarModalListas() {
    this.mostrarModalListas = false;
  }

  // ---------- SEGUIMIENTO ----------
  private checkIfFollowing(idSerieTMDB: string) {
    if (!this.auth.hasValidSession()) return;

    this.seguimientoService.getSeguimientos().subscribe({
      next: (res) => {
        const siguiendo = res.some((s: any) => s.idSerieTMDB == idSerieTMDB);
        this.isFollowing = siguiendo;
      },
      error: (err) => console.error('Error al comprobar seguimiento:', err),
    });
  }

  toggleSeguimiento() {
    if (!this.auth.hasValidSession()) return;

    const idSerieTMDB = this.serie.id || this.serie._id;
    if (!idSerieTMDB) return;

    if (this.isFollowing) {
      this.seguimientoService.eliminarSeguimiento(idSerieTMDB).subscribe({
        next: () => (this.isFollowing = false),
        error: (err) => console.error('Error al eliminar seguimiento:', err),
      });
    } else {
      const seguimientoData = {
        idSerieTMDB,
        titulo: this.serie.name,
        poster_path: this.serie.poster_path,
        totalTemporadas: this.serie.number_of_seasons || 0,
      };

      this.seguimientoService.agregarSeguimiento(seguimientoData).subscribe({
        next: () => (this.isFollowing = true),
        error: (err) => console.error('Error al agregar seguimiento:', err),
      });
    }
  }

  // ---------- TRAILER  ----------
  abrirTrailer() {
    if (!this.serie) return;

    const id = this.serie.id || this.serie._id;

    this.seriesService.getTrailer(id).subscribe({
      next: (res) => {
        this.youtubeKey = res.key;

        if (this.youtubeKey) {
          const rawUrl = `https://www.youtube-nocookie.com/embed/${this.youtubeKey}?autoplay=1`;
          this.youtubeURL = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
        }

        this.mostrarTrailer = true;
      },
      error: (err) => console.error("Error obteniendo trailer", err)
    });
  }

  cerrarTrailer() {
    this.mostrarTrailer = false;
    this.youtubeKey = null;
    this.youtubeURL = null;
  }
}
