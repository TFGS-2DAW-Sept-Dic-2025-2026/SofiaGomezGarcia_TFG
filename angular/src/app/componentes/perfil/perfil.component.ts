import { Component, OnInit, Input, inject, ViewEncapsulation } from '@angular/core';
import { seriesService } from '../../servicios/series.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';
import IUsuario from '../../modelos/interfaces_orm/IUsuario';
import { ListasService } from '../../servicios/listas.service';
import { LayoutComponent } from '../layout/layout.component';
import { FavoritasPerfilComponent } from './favoritas-perfil/favoritas-perfil.component';
import { ActividadPerfilComponent } from './actividad-perfil/actividad-perfil.component';
import { ListasPublicasPerfilComponent } from './listas-publicas-perfil/listas-publicas-perfil.component';
import { UsuariosService } from '../../servicios/usuarios.service';


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
  esMiPerfil = false;
  fotoSeleccionada?: File;

  auth = inject(AuthService);
  listasService = inject(ListasService);
  seriesService = inject(seriesService);
  usuariosService = inject(UsuariosService);
  route = inject(ActivatedRoute);


  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const username = params.get('username');
    const miUsername = this.auth.getDatosUsuario()?.username;

    if (!username) {
      
      this.usuario = this.auth.getDatosUsuario()!;
      this.esMiPerfil = true;
      return;
    }

    if (username === miUsername) {
     
      this.usuario = this.auth.getDatosUsuario()!;
      this.esMiPerfil = true;
      return;
    }

    this.esMiPerfil = false;
    this.cargarUsuarioPorUsername(username);
  });
}


 
  cargarUsuario(userId: string) {
    this.usuariosService.obtenerUsuarioPorID(userId).subscribe({
      next: (res) => {
        console.log('Respuesta completa del backend:', res);
        this.usuario = res.usuario;
      },
      error: (err) => {
        console.error('Error cargando usuario:', err);
      }
    });
  }


  cargarUsuarioPorUsername(username: string) {
  this.usuariosService.obtenerUsuarioPorUsername(username).subscribe({
    next: (res) => {
      console.log('Usuario cargado correctamente:', res);
      this.usuario = res.usuario || res; 
    },
    error: (err) => {
      console.error('Error cargando usuario:', err);
    }
  });
}

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fotoSeleccionada = input.files[0];
      this.subirFotoPerfil();
    }
  }

  subirFotoPerfil() {
    if (!this.fotoSeleccionada || !this.usuario) return;

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

  enviarSolicitudAmistad() {
    // TODO: implementar lógica de amistad
  }
}