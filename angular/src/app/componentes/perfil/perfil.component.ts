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
import { OpinionesPerfilComponent } from './opiniones-perfil/opiniones-perfil.component';


@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, FavoritasPerfilComponent, ActividadPerfilComponent, ListasPublicasPerfilComponent,OpinionesPerfilComponent],

})
export class PerfilComponent implements OnInit {
  @Input() userId?: string;

  usuario!: IUsuario;
  seguidores: IUsuario[] = [];
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
      const miUsuario = this.auth.getDatosUsuario();
      const miUsername = miUsuario?.username;

      if (!username || username === miUsername) {
        this.esMiPerfil = true;
        this.usuario = miUsuario!;
        return;
      }

      // Perfil externo
      this.esMiPerfil = false;
      if (username) this.cargarUsuarioPorUsername(username);
    });
  }

  cargarUsuario(userId: string) {
    this.usuariosService.obtenerUsuarioPorID(userId).subscribe({
      next: (res) => {
        this.usuario = res.usuario || res;
        this.seguidores = this.usuario.seguidores || [];
        console.log('Usuario cargado:', this.usuario);
      },
      error: (err) => console.error('Error cargando usuario:', err)
    });
  }

  cargarUsuarioPorUsername(username: string) {
    this.usuariosService.obtenerUsuarioPorUsername(username).subscribe({
      next: (res) => {
        this.usuario = res.usuario || res;
        console.log('Usuario cargado correctamente:', this.usuario);
      },
      error: (err) => console.error('Error cargando usuario:', err)
    });
  }

  onFotoSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fotoSeleccionada = input.files[0];

      if (this.usuario?.id) {
        this.subirFotoPerfil();
      } else {
        console.warn('Usuario aún no cargado, espera a que termine la petición.');
      }
    }
  }

  subirFotoPerfil() {
    if (!this.fotoSeleccionada) return;
    if (!this.usuario?.id) {
      console.error("No existe ID de usuario para subir la foto.");
      return;
    }

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