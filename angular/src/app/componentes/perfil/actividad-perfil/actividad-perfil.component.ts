import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import IUsuario from '../../../modelos/interfaces_orm/IUsuario';
import { forkJoin } from 'rxjs';
import { SeguimientoService } from '../../../servicios/seguimiento.service';
import { seriesService } from '../../../servicios/series.service';
import { OpinionService } from '../../../servicios/opinion.service';
import { AuthService } from '../../../servicios/auth.service';
import { PerfilService } from '../../../servicios/perfil.service';

@Component({
  selector: 'app-actividad-perfil',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './actividad-perfil.component.html',
  styleUrl: './actividad-perfil.component.css'
})
export class ActividadPerfilComponent implements OnInit {
  @Input() usuario!: IUsuario;
  actividad: any[] = [];

  private seriesService = inject(seriesService);
  private seguimientoService = inject(SeguimientoService);
  private opinionesService = inject(OpinionService);
  private perfilService = inject(PerfilService);
  private auth = inject(AuthService);

  ngOnInit(): void {
    if (!this.usuario) return;

    const usuarioLogueado = this.auth.datosUsuario$();
    const esMiPerfil = !!(usuarioLogueado && usuarioLogueado.id === this.usuario.id);
    this.cargarActividad(esMiPerfil);
  }



  cargarActividad(esMiPerfil: boolean) {
    let seguimientos$;
    let opiniones$;

    if (esMiPerfil) {
      seguimientos$ = this.seguimientoService.getSeguimientos();
      opiniones$ = this.opinionesService.obtenerOpinionesUsuario(this.usuario.id);
    } else {
      seguimientos$ = this.perfilService.obtenerSeguimientosPublicos(this.usuario.username);
      opiniones$ = this.perfilService.obtenerOpinionesPublicas(this.usuario.username);
    }

    forkJoin([seguimientos$, opiniones$]).subscribe({
      next: ([seguimientos, opiniones]) => {
        const recientesSeg = seguimientos
          .sort((a: any, b: any) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime())
          .slice(0, 5);

        const idsSeries = [
          ...recientesSeg.map((s: any) => s.idSerieTMDB),
          ...opiniones.map((op: any) => op.idSerie)
        ];

        const requests = idsSeries.map(id => this.seriesService.getSeriesByID(id));

        forkJoin(requests).subscribe({
          next: (seriesDetalles) => {
            const detallesSeg = seriesDetalles.slice(0, recientesSeg.length);
            const detallesOpin = seriesDetalles.slice(recientesSeg.length);

            const actividadSeg = recientesSeg.map((s: any, i: number) => ({
              tipo: 'seguimiento',
              serie: detallesSeg[i],
              descripcion: this.generarDescripcion(s),
              fecha: s.fechaActualizacion
            }));

            const actividadOpiniones = opiniones.map((op: any, i: number) => ({
              tipo: 'opinion',
              serie: detallesOpin[i],
              descripcion: 'Ha publicado una reseña',
              fecha: op.fecha
            }));

            this.actividad = [...actividadSeg, ...actividadOpiniones]
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .slice(0, 5);
          },
          error: (err) => console.error('Error cargando detalles de series:', err)
        });
      },
      error: (err) => console.error('Error cargando actividad:', err)
    });
  }



  generarDescripcion(s: any): string {
    if (s.estado === 'completada') {
      return `Ha completado la serie`;
    }

    if (s.estado === 'siguiendo' && s.ultimoCapitulo) {
      return `Ha visto el episodio T${s.ultimoCapitulo.temporada} E${s.ultimoCapitulo.numero}`;
    }

    if (s.estado === 'pendiente') {
      return `Ha comenzado a ver esta serie`;
    }

    if (s.estado === 'noComenzada') {
      return `Ha comenzado a seguir la serie`;
    }

    return "Ha publicado una reseña";


  }
}
