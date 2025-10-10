import { Component, OnInit, Input, inject, ViewEncapsulation } from '@angular/core';
// import { ListasService } from '../services/listas.service';
// import IUsuario from '../modelos/interfaces_orm/IUsuario';
import { seriesService } from '../../servicios/series.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import IUsuario from '../../modelos/interfaces_orm/IUsuario';
import { ListasService } from '../../servicios/listas.service';
import { LayoutComponent } from '../layout/layout.component';
// import ILista from '../modelos/interfaces_orm/ILista';
// import ISerie from '../modelos/interfaces_orm/ISerie';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],

})
export class PerfilComponent implements OnInit {
  @Input() userId?: string; // Si se ve otro usuario

  usuario!: IUsuario;
  amigos: IUsuario[] = [];
  lista: any = null;
  esMiPerfil = false;

  auth = inject(AuthService);
  listasService = inject(ListasService);
  seriesService = inject(seriesService);
  fotoSeleccionada?: File;

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fotoSeleccionada = input.files[0];
      this.subirFotoPerfil();
    }
  }

  subirFotoPerfil() {
    if (!this.fotoSeleccionada) return;

    const formData = new FormData();
    formData.append('foto', this.fotoSeleccionada);
    formData.append('userId', this.usuario.id); 

    this.auth.subirFotoPerfil(formData).subscribe({
      next: (res) => {
        this.usuario.fotoPerfil = res.url;
        this.auth.actualizarDatosUsuario(this.usuario);
      },
      error: (err) => console.error('Error al subir foto:', err)
    });
  }



  ngOnInit(): void {
    if (!this.userId || this.userId === this.auth.getDatosUsuario()?.id) {
      this.usuario = this.auth.getDatosUsuario()!;
      this.esMiPerfil = true;
    } else {
      // TODO: traer datos de otro usuario por ID
    }




    // this.cargarAmigos();
    // this.cargarListasPublicas();
    // this.cargarSeriesFavoritas();
  }

  // cargarAmigos() {
  //   // ejemplo simple: suponiendo que el usuario tiene array de amigos
  //   this.amigos = this.usuario.amigos || [];
  // }

  // cargarListasPublicas() {
  //   this.listasService.obtenerListasUsuario(this.usuario.id).subscribe(listas => {
  //     this.listasPublicas = listas.filter(l => l.publica);
  //   });
  // }

  // cargarSeriesFavoritas() {
  //   // Si el usuario tiene top5 guardado
  //   if (this.usuario.seriesFavoritasIds?.length) {
  //     this.seriesService.getSeriesByIds(this.usuario.seriesFavoritasIds.slice(0,5)).subscribe(series => {
  //       this.seriesFavoritas = series;
  //     });
  //   }
  // }

  enviarSolicitudAmistad() {
    // Implementar la lógica de amistad
  }
}