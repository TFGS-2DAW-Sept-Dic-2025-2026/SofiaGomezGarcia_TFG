import { Component, OnInit, Input, inject, ViewEncapsulation } from '@angular/core';
import { seriesService } from '../../servicios/series.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import IUsuario from '../../modelos/interfaces_orm/IUsuario';
import { ListasService } from '../../servicios/listas.service';
import { LayoutComponent } from '../layout/layout.component';
import { FavoritasPerfilComponent } from './favoritas-perfil/favoritas-perfil.component';
import { ActividadPerfilComponent } from './actividad-perfil/actividad-perfil.component';
import { ListasPublicasPerfilComponent } from './listas-publicas-perfil/listas-publicas-perfil.component';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, FavoritasPerfilComponent, ActividadPerfilComponent, ListasPublicasPerfilComponent],

})
export class PerfilComponent implements OnInit {
  @Input() userId?: string; 

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




   
  }

 

  enviarSolicitudAmistad() {
    // Implementar la lógica de amistad
  }
}