import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { seriesService } from '../../servicios/series.service';
import { ListasService } from '../../servicios/listas.service';
import { forkJoin } from 'rxjs';
import { LayoutComponent } from '../layout/layout.component';

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
  route = inject(ActivatedRoute);

  isLoggedIn = false;
  lista: any = null;
  loading = true;

  ngOnInit() {
    this.isLoggedIn = this.auth.hasValidSession();
    if (!this.isLoggedIn) return;

    const idLista = this.route.snapshot.paramMap.get('id'); // Obtener el ID de la lista desde la URL
    if (idLista) this.cargarLista(idLista);
  }

  cargarLista(idLista: string) {
    this.loading = true;
    this.listasService.obtenerListaPorId(idLista).subscribe({
      next: async (res) => {
        this.lista = res;

        // Recibe el id de la lista y a partir de este hace un map con los datos de todas las series que tiene la lista a partir de su id para poder mostrar estos datos
        // Comprobacion de si hay listas
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
    const idLista = this.lista._id;
    this.listasService.eliminarSerieDeLista(idLista, idSerie)
      .subscribe({
        next: listaActualizada => {

          this.lista.series = listaActualizada.series;


          if (this.lista.series.length) {
            const observables = this.lista.series.map((serieId: string) =>
              this.seriesService.getSeriesByID(serieId)
            );

            forkJoin(observables).subscribe({
              next: (seriesCompletas) => {
                this.lista.series = seriesCompletas;
              },
              error: (err) => console.error('Error recargando series:', err)
            });
          }
        },
        error: err => console.error('Error al eliminar serie:', err)
      });
  }
}