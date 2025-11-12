import { CommonModule } from '@angular/common';
import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../servicios/auth.service';
import { OpinionService } from '../../../servicios/opinion.service';
import { Router } from '@angular/router';



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
  router = inject(Router);

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


  irPerfil(username: string) {

    if (!username) return;
    const usuarioActual = this.auth.getDatosUsuario();

    if (usuarioActual && username === usuarioActual.username) {
      this.router.navigate(['/perfil']);
    } else {
      this.router.navigate(['/usuario', username]);
    }
  }



  cargarOpiniones() {
    const usuarioId = this.auth.getDatosUsuario()?.id;

    this.opinionesService.obtenerOpinionesSerie(this.serieId).subscribe({
      next: (opiniones) => {
        this.opiniones = opiniones.map((o: any) => ({
          ...o,
          usuarioHaDadoMeGusta: o.usuariosMeGusta?.includes(usuarioId)
        }));
      },
      error: (err) => {
        console.error('Error al cargar opiniones:', err);
      }
    });
  }



  guardarOpinion() {
    if (!this.miOpinion.opinion || this.miOpinion.estrellas < 1) return;

    this.opinionesService.guardarOpinionSerie(this.serieId, this.miOpinion).subscribe({
      next: (nuevaOp) => {
        this.opiniones.push(nuevaOp);
        this.miOpinion = { titulo: '', estrellas: 5, opinion: '' };
        this.cargarOpiniones();
      },
      error: (err) => console.error('Error guardando opinión', err)
    });
  }

  toggleMeGusta(opinion: any) {
    this.opinionesService.darMeGustaOpinion(opinion._id).subscribe({
      next: (actualizada) => {
        opinion.meGusta = actualizada.meGusta;

        const usuarioId = this.auth.getDatosUsuario()?.id;
        opinion.usuarioHaDadoMeGusta = actualizada.usuariosMeGusta.includes(usuarioId);
      },
      error: (err) => console.error('Error al dar/quitar me gusta:', err)
    });
  }
}
