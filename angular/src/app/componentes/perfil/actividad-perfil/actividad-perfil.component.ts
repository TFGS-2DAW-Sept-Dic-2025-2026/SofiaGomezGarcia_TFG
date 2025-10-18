import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import IUsuario from '../../../modelos/interfaces_orm/IUsuario';
import { forkJoin } from 'rxjs';
import { SeguimientoService } from '../../../servicios/seguimiento.service';
import { seriesService } from '../../../servicios/series.service';

@Component({
  selector: 'app-actividad-perfil',
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './actividad-perfil.component.html',
  styleUrl: './actividad-perfil.component.css'
})
export class ActividadPerfilComponent implements OnInit {
@Input() usuario!: IUsuario;
  actividad: any[] = [];

  private seriesService = inject(seriesService);
  private seguimientoService = inject(SeguimientoService);

  ngOnInit(): void {
    if (this.usuario?.id) {
      this.cargarActividad();
    }
  }

  cargarActividad() {
  this.seguimientoService.getSeguimientos().subscribe({
    next: (seguimientos: any[]) => {
      // Ordenar por fecha descendente y limitar a las 5 ultimas series actualizadas
      const recientes = seguimientos
        .sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime())
        .slice(0, 5);

      const requests = recientes.map(s => this.seriesService.getSeriesByID(s.idSerieTMDB));

      forkJoin(requests).subscribe({
        next: (seriesDetalles) => {
          this.actividad = recientes.map((s, i) => ({
            serie: seriesDetalles[i],
            descripcion: this.generarDescripcion(s),
            fecha: s.fechaActualizacion
          }));
        },
        error: (err) => console.error('Error cargando detalles de series:', err)
      });
    },
    error: (err) => console.error('Error obteniendo seguimientos:', err)
  });
}

  generarDescripcion(s: any): string {
    if (s.estado === 'completada') {
      return `Has completado la serie`;
    }

    if (s.estado === 'siguiendo' && s.ultimoCapitulo) {
      return `Has visto el episodio T${s.ultimoCapitulo.temporada} E${s.ultimoCapitulo.numero}`;
    }

    if (s.estado === 'pendiente') {
      return `Has comenzado a ver esta serie`;
    }

    return `Has comenzado a seguir la serie`;
  }
}
