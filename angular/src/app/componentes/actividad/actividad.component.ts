import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { FavoritasPerfilComponent } from '../perfil/favoritas-perfil/favoritas-perfil.component';
import { ActividadPerfilComponent } from '../perfil/actividad-perfil/actividad-perfil.component';
import { ListasPublicasPerfilComponent } from '../perfil/listas-publicas-perfil/listas-publicas-perfil.component';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { SeguimientoService } from '../../servicios/seguimiento.service';
import { OpinionService } from '../../servicios/opinion.service';
import { seriesService } from '../../servicios/series.service';
import { AuthService } from '../../servicios/auth.service';
import { ActividadService } from '../../servicios/actividad.service';
import { PerfilService } from '../../servicios/perfil.service';

@Component({
  selector: 'app-actividad',
  imports: [CommonModule, RouterModule, LayoutComponent],
  templateUrl: './actividad.component.html',
  styleUrl: './actividad.component.css'
})
export class ActividadComponent implements OnInit {
  actividad: any[] = []
  cargando = true;

  auth = inject(AuthService);
  seriesService = inject(seriesService);
  actividadService = inject(ActividadService);
  perfilService = inject(PerfilService);

  ngOnInit(): void {
    this.cargarActividadSeguidores();
  }

  cargarActividadSeguidores() {
  const usuario = this.auth.getDatosUsuario();

  if (!usuario?.id) {
    console.warn('No hay usuario logueado o id undefined');
    this.actividad = [];
    this.cargando = false;
    return;
  }

  this.actividadService.obtenerUsuariosSeguidos(usuario.id).pipe(
    switchMap((seguidos: any[]) => {
      if (!seguidos || seguidos.length === 0) return of([]);

      const observables = seguidos.map((seguido) =>
        forkJoin({
          seguimientos: this.perfilService.obtenerSeguimientosPublicos(seguido.username),
          opiniones: this.perfilService.obtenerOpinionesPublicas(seguido.username)
        }).pipe(map(res => ({ seguido, ...res })))
      );

      return forkJoin(observables);
    }),
    switchMap((resultados: any[]) => {
      if (!resultados.length) return of([]);

      let actividadCompuesta: any[] = [];

      resultados.forEach(({ seguido, seguimientos, opiniones }) => {
        const actSeg = seguimientos.map((s: any) => ({
          tipo: 'seguimiento',
          usuario: seguido.username,
          idUsuario: seguido.id,
          idSerie: s.idSerieTMDB,
          fecha: s.fechaActualizacion,
          estado: s.estado,
          descripcion: this.generarDescripcion(s)
        }));

        const actOpin = opiniones.map((o: any) => ({
          tipo: 'opinion',
          usuario: seguido.username,
          idUsuario: seguido.id,
          idSerie: o.idSerie,
          fecha: o.fecha,
          descripcion: 'Ha publicado una reseña'
        }));

        actividadCompuesta.push(...actSeg, ...actOpin);
      });

      const idsSeries = [...new Set(actividadCompuesta.map(a => a.idSerie))];
      if (!idsSeries.length) return of(actividadCompuesta);

      const peticionesSeries = idsSeries.map(id => this.seriesService.getSeriesByID(id));

      return forkJoin(peticionesSeries).pipe(
        map(seriesDetalles => {
          const mapaSeries = new Map(seriesDetalles.map((s: any) => [s.id || s.idSerieTMDB, s]));
          return actividadCompuesta
            .map(item => ({ ...item, serie: mapaSeries.get(item.idSerie) }))
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        })
      );
    })
  ).subscribe({
    next: (actividad) => {
      this.actividad = actividad;
      this.cargando = false;
    },
    error: (err) => {
      console.error('Error cargando actividad:', err);
      this.cargando = false;
    }
  });
}

  generarDescripcion(s: any): string {
    if (s.estado === 'completada') return 'Ha completado una serie';
    if (s.estado === 'siguiendo' && s.ultimoCapitulo)
      return `Ha visto el episodio T${s.ultimoCapitulo.temporada} E${s.ultimoCapitulo.numero}`;
    if (s.estado === 'pendiente') return 'Ha comenzado una serie';
    if (s.estado === 'noComenzada') return 'Ha empezado a seguir una serie';
    return 'Ha publicado una reseña';
  }
}