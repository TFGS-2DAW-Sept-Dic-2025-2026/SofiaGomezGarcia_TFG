import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import IUsuario from '../../../modelos/interfaces_orm/IUsuario';
import { OpinionService } from '../../../servicios/opinion.service';
import { seriesService } from '../../../servicios/series.service';
import { forkJoin, of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-opiniones-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './opiniones-perfil.component.html',
  styleUrls: ['./opiniones-perfil.component.css']
})
export class OpinionesPerfilComponent implements OnChanges {
  @Input() usuario!: IUsuario;

  opiniones: any[] = [];
  opinionesConSeries: any[] = [];

  private opinionesService = inject(OpinionService);
  private seriesService = inject(seriesService);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
      // Aceptar tanto id como _id
      const userId = (this.usuario.id || this.usuario._id);
      if (userId) {
        this.cargarOpiniones(userId);
      }
    }
  }

  cargarOpiniones(userId: string) {
    this.opinionesService.obtenerOpinionesUsuario(userId).subscribe({
      next: (opiniones) => {
        this.opiniones = opiniones || [];
        if (this.opiniones.length === 0) {
          this.opinionesConSeries = [];
          return;
        }

        const requests = this.opiniones.map(op => 
          this.seriesService.getSeriesByID(op.idSerie)
        );

        forkJoin(requests).subscribe({
          next: (seriesDetalles) => {
            this.opinionesConSeries = this.opiniones.map((op, i) => ({
              ...op,
              serie: seriesDetalles[i]
            }));
          },
          error: (err) => console.error('Error cargando detalles de series:', err)
        });
      },
      error: (err) => console.error('Error cargando opiniones:', err)
    });
  }
}
