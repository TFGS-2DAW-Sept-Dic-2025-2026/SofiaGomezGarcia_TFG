import { CommonModule } from '@angular/common';
import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { seriesService } from '../../../servicios/series.service';
import { AuthService } from '../../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import { PerfilService } from '../../../servicios/perfil.service';
import { forkJoin, lastValueFrom, Observable } from 'rxjs';



@Component({
  selector: 'app-favoritas-perfil',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './favoritas-perfil.component.html',
  styleUrl: './favoritas-perfil.component.css'
})
export class FavoritasPerfilComponent implements OnInit {

  //@input permite enviar informacion desde el componente padre al componente hijo
  @Input() usuario!: any;
  @Input() esMiPerfil = false;

  seriesService = inject(seriesService);
  auth = inject(AuthService);
  perfilService = inject(PerfilService);

  favoritas: any[] = [];
  selectorAbierto = false;
  busqueda: string = '';
  resultadosBusqueda: any[] = [];
  favoritasSeleccionadas: any[] = [];


  ngOnInit(): void {
  if (this.usuario) {
    this.cargarFavoritas();
  } else {
    effect(() => {
      const user = this.auth.datosUsuario$(); 
      if (user) {
        this.usuario = user;
        this.cargarFavoritas();
      }
    });
  }
}


cargarFavoritas() {
  this.favoritas = [];

  if (this.esMiPerfil) {
    if (!this.usuario?.id) return;
    this.perfilService.obtenerFavoritasPerfil(this.usuario.id).subscribe({
      next: (res: any) => {
        const ids: string[] = res.favoritas || [];
        this.cargarDetallesSeries(ids);
      },
      error: (err) => console.error('Error obteniendo favoritas del perfil propio:', err)
    });
  } 
 
  else {
    if (!this.usuario?.username) return;
    this.perfilService.obtenerFavoritasPerfilPublico(this.usuario.username).subscribe({
      next: (res: any) => {
        const ids: string[] = res.favoritas || [];
        this.cargarDetallesSeries(ids);
      },
      error: (err) => console.error('Error obteniendo favoritas del perfil público:', err)
    });
  }
}

private cargarDetallesSeries(ids: string[]) {
  if (!ids.length) return;
  const requests: Observable<any>[] = ids.map(id => this.seriesService.getSeriesByID(id));
  forkJoin(requests).subscribe({
    next: (detalles: any[]) => {
      this.favoritas = detalles.filter(s => s != null);
    },
    error: (err) => {
      console.error('Error cargando detalles de series favoritas:', err);
      this.favoritas = [];
    }
  });
}


  abrirSelector() {
    this.selectorAbierto = true;
    this.favoritasSeleccionadas = [...this.favoritas]; //se clonan las favoritas actuales
  }

  cerrarSelector() {
    this.selectorAbierto = false;
    this.busqueda = '';
    this.favoritasSeleccionadas = [];
  }

  buscarSeries() {
    if (this.busqueda.trim().length < 2) {
      return;
    }
    this.seriesService.buscarSeries({ query: this.busqueda, page: 1 }).subscribe({
      next: (res) => {
        this.resultadosBusqueda = res.results;
      },
      error: (err) => console.error('Error al buscar series:', err)
    });

  }

  toggleSeleccion(serie: any) {
    const index = this.favoritasSeleccionadas.findIndex(s => s.id === serie.id);
    if (index >= 0) {
      this.favoritasSeleccionadas.splice(index, 1);
    } else if (this.favoritasSeleccionadas.length < 4) { //maximo 4 favoritas
      this.favoritasSeleccionadas.push(serie);
    }
  }

  guardarFavoritas() {
    const idsFavoritas = this.favoritasSeleccionadas.map(s => s.id.toString());

    this.perfilService.actualizarFavoritasPerfil(this.usuario.id, idsFavoritas).subscribe({
      next: (res) => {
        this.usuario.perfilFavoritas = idsFavoritas;
        this.favoritas = [...this.favoritasSeleccionadas];
        this.auth.actualizarDatosUsuario(this.usuario); 
        this.cerrarSelector();
      },
      error: (err) => console.error('Error al guardar favoritas:', err)
    });
  }


}
