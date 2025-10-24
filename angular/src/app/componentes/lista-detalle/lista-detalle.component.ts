import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { seriesService } from '../../servicios/series.service';
import { ListasService } from '../../servicios/listas.service';
import { forkJoin } from 'rxjs';
import { LayoutComponent } from '../layout/layout.component';
import { PerfilService } from '../../servicios/perfil.service';

@Component({
  selector: 'app-lista-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule,LayoutComponent],
  templateUrl: './lista-detalle.component.html',
  styleUrls: ['./lista-detalle.component.css']
})
export class ListaDetalleComponent implements OnInit {
  auth = inject(AuthService);
  listasService = inject(ListasService);
  seriesService = inject(seriesService);
  perfilService = inject(PerfilService);
  route = inject(ActivatedRoute);

  isLoggedIn = false;
  esPublica = false;
  lista: any = null;
  loading = true;

  ngOnInit() {
   
    this.isLoggedIn = this.auth.hasValidSession();

    
    const idLista = this.route.snapshot.paramMap.get('id');
    this.esPublica = this.route.snapshot.queryParamMap.get('publica') === 'true';

    if (idLista) this.cargarLista(idLista, this.esPublica);
  }

  cargarLista(idLista: string, esPublica: boolean) {
    this.loading = true;

    const observable = esPublica
      ? this.perfilService.obtenerListaPublicaPorId(idLista)
      : this.listasService.obtenerListaPorId(idLista);

    observable.subscribe({
      next: (res) => {
        this.lista = res;

        if (this.lista.series?.length) {
          const observables = this.lista.series.map((serieId: string) =>
            this.seriesService.getSeriesByID(serieId)
          );

          forkJoin(observables).subscribe({
            next: (seriesCompletas) => {
              this.lista.series = seriesCompletas;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error cargando series por id:', err);
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error cargando lista:', err);
        this.loading = false;
      }
    });
  }

  eliminarSerie(idSerie: string) {
    if (!this.lista || !this.lista._id) return;

    const idLista = this.lista._id;

    this.listasService.eliminarSerieDeLista(idLista, idSerie)
      .subscribe({
        next: (listaActualizada) => {
          this.lista.series = listaActualizada.series;

          if (this.lista.series.length) {
            const observables = this.lista.series.map((serieId: string) =>
              this.seriesService.getSeriesByID(serieId)
            );

            forkJoin(observables).subscribe({
              next: (seriesCompletas) => this.lista.series = seriesCompletas,
              error: (err) => console.error('Error recargando series:', err)
            });
          }
        },
        error: (err) => console.error('Error al eliminar serie:', err)
      });
  }
}

 