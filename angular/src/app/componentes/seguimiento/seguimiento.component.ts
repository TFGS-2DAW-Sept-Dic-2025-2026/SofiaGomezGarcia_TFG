import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { seriesService } from '../../servicios/series.service';
import { SeguimientoService } from '../../servicios/seguimiento.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.css']
})
export class SeguimientoComponent implements OnInit {
  auth = inject(AuthService);
  seriesService = inject(seriesService);
  seguimientoService = inject(SeguimientoService);

  series: any[] = [];
  filtro: 'siguiendo' | 'noComenzada' | 'completada' = 'siguiendo';
  loading = true;

  ngOnInit() {
    if (this.auth.hasValidSession()) {
      this.cargarSeguimientos();
    }
  }

  cargarSeguimientos() {
    this.loading = true;
    this.seguimientoService.getSeguimientos().subscribe({
      next: (res: any[]) => {
        const filtradas = res.filter(s => s.estado === this.filtro);
        const requests = filtradas.map(s => this.seriesService.getSeriesByID(s.idSerieTMDB));

        if (requests.length > 0) {
          forkJoin(requests).subscribe({
            next: (detalles) => {
              const seriesConTitulo$ = detalles.map((serie, i) => {
                const seguimiento = filtradas[i];
                const temporadas = (serie.seasons || []).filter((s: any) => s.season_number > 0);
                const totalTemporadas = temporadas.length;

                let { temporada, numero } = seguimiento.ultimoCapitulo || { temporada: 1, numero: 0 };

                if (seguimiento.estado === 'completada') {
                  return Promise.resolve({ ...serie, seguimiento, siguienteCapitulo: 'Serie completada' });
                }

                const siguienteNumero = numero + 1;
                let siguienteTemporada = temporada;
                let siguienteCapitulo = '';

                //Si el siguiente capitulo es mayor que el numero de capitulos de la temporada actual, pasamos a la siguiente temporada
                if (siguienteNumero > (temporadas[temporada - 1]?.episode_count || 0)) {
                  siguienteTemporada += 1;
                }

                //Si la siguiente temporada es mayor que el total de temporadas, la serie está completada
                if (siguienteTemporada > totalTemporadas) {
                  siguienteCapitulo = 'Serie completada';
                  return Promise.resolve({ ...serie, seguimiento, siguienteCapitulo });
                }

                //Aun quedan capitulos por ver
                return firstValueFrom(this.seriesService.getTemporada(serie.id, siguienteTemporada))
                  .then((tempData: any) => {
                    const episodio = tempData.episodes.find((e: any) =>
                      e.episode_number === (siguienteTemporada === temporada ? siguienteNumero : 1)
                    );
                    siguienteCapitulo = episodio?.name || `T${siguienteTemporada}E${siguienteNumero}`;
                    return { ...serie, seguimiento, siguienteCapitulo };
                  });
              });

              Promise.all(seriesConTitulo$).then(seriesFinal => {
                this.series = seriesFinal;
                this.loading = false;
              });
            },
            error: (err) => {
              console.error('Error cargando detalles de series:', err);
              this.loading = false;
            }
          });
        } else {
          this.series = [];
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error obteniendo seguimientos:', err);
        this.loading = false;
      }
    });
  }

  cambiarFiltro(estado: 'siguiendo' | 'noComenzada' | 'completada') {
    this.filtro = estado;
    this.cargarSeguimientos();
  }

  marcarCapituloVisto(serie: any) {
    const seguimiento = serie.seguimiento;
    const temporadas = (serie.seasons || []).filter((s: any) => s.season_number > 0);
    const totalTemporadas = temporadas.length;

    let { temporada, numero } = seguimiento.ultimoCapitulo || { temporada: 1, numero: 0 };

    const temporadaIndex = temporada - 1;
    const capActualTemp = temporadas[temporadaIndex]?.episode_count || 0;

    numero += 1;

    if (numero > capActualTemp) {
      temporada += 1;
      numero = 1;
    }

    let nuevoEstado: 'siguiendo' | 'completada' = 'siguiendo';
    if (temporada > totalTemporadas) {
      nuevoEstado = 'completada';
      temporada = totalTemporadas;
      numero = temporadas[totalTemporadas - 1]?.episode_count || numero;
    }

    this.seguimientoService.actualizarSeguimiento(seguimiento.idSerieTMDB, {
      capitulosVistos: (seguimiento.capitulosVistos || 0) + 1,
      ultimoCapitulo: { temporada, numero },
      estado: nuevoEstado
    }).subscribe({
      next: () => this.cargarSeguimientos(),
      error: (err) => console.error('Error al marcar como visto:', err)
    });
  }


}