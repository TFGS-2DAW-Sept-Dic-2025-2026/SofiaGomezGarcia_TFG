import { CommonModule } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../servicios/auth.service';
import { OpinionService } from '../../../servicios/opinion.service';

@Component({
  selector: 'app-opinion-serie',
  imports: [FormsModule, CommonModule],
  templateUrl: './opinion-serie.component.html',
  styleUrl: './opinion-serie.component.css'
})
export class OpinionSerieComponent {
   @Input() serieId!: string;

  auth = inject(AuthService);
  opinionesService = inject(OpinionService);

  opiniones: any[] = [];  
  miOpinion = { titulo: '', estrellas: 5, opinion: '' };
  isLoggedIn = false;

  ngOnInit(): void {
    this.isLoggedIn = !!this.auth.getSessionToken();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serieId'] && this.serieId) {
      this.cargarOpiniones();
    }
  }

  cargarOpiniones() {
    this.opinionesService.obtenerOpinionesSerie(this.serieId).subscribe({
      next: (res) => {
        this.opiniones = res || [];  // aunque venga vacío
        console.log('Opiniones cargadas', this.opiniones);
      },
      error: (err) => {
        console.error('Error cargando opiniones', err);
        this.opiniones = [];  // fallback
      }
    });
  }

  guardarOpinion() {
    if (!this.miOpinion.opinion || this.miOpinion.estrellas < 1) return;

    this.opinionesService.guardarOpinionSerie(this.serieId, this.miOpinion).subscribe({
      next: (nuevaOp) => {
        this.opiniones.push(nuevaOp); 
        this.miOpinion = { titulo: '', estrellas: 5, opinion: '' }; // Para limpiar el usuario
        this.cargarOpiniones(); // Se vuelven a cargar las opiniones para que salgan los nombres de usuarios actualizados
      },
      error: (err) => console.error('Error guardando opinión', err)
    });
  }
}