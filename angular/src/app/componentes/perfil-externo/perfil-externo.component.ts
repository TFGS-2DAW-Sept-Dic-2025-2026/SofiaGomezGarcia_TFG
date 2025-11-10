import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../servicios/usuarios.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { ActividadPerfilComponent } from '../perfil/actividad-perfil/actividad-perfil.component';
import { ListasPublicasPerfilComponent } from '../perfil/listas-publicas-perfil/listas-publicas-perfil.component';
import { FavoritasPerfilComponent } from '../perfil/favoritas-perfil/favoritas-perfil.component';
import { PerfilService } from '../../servicios/perfil.service';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-perfil-externo',
  imports: [FormsModule, CommonModule, LayoutComponent, ActividadPerfilComponent, ListasPublicasPerfilComponent, FavoritasPerfilComponent],
  templateUrl: './perfil-externo.component.html',
  styleUrl: './perfil-externo.component.css'
})
export class PerfilExternoComponent implements OnInit {
  usuario: any;
  loading = true;
  siguiendo = false;
  miId!: string; //id del usuario autenticado
  modalVisible = false;
  usuarioADejarSeguir!: any;

  route = inject(ActivatedRoute);
  usuarioService = inject(UsuariosService);
  perfilService = inject(PerfilService);
  auth = inject(AuthService);


  ngOnInit(): void {
    this.miId = this.auth.getUserIdFromToken();
    this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (username) {
        this.cargarUsuarioPorUsername(username);
      }
    });
  }

  cargarUsuarioPorUsername(username: string) {
    this.usuarioService.obtenerUsuarioPorUsername(username).subscribe({
      next: (res) => {
        this.usuario = res.usuario || res;
        this.loading = false;

        this.comprobarSiSigoUsuario();

      },
      error: (err) => {
        console.error('Error cargando usuario externo:', err);
        this.loading = false;
      }
    });
  }

  comprobarSiSigoUsuario() {
    if (!this.usuario?.seguidores) {
      this.siguiendo = false;
      return;
    }
    this.siguiendo = this.usuario.seguidores.includes(this.miId);
  }


  toggleSeguir() {
    if (!this.usuario?._id) return;

    if (this.siguiendo) {
      this.usuarioADejarSeguir = this.usuario;
      this.modalVisible = true;
    } else {
      this.perfilService.seguirUsuario(this.usuario._id).subscribe({
        next: (res) => {
          console.log(res.msg);
          this.siguiendo = true;
          this.usuario.seguidores.push(this.miId);
        },
        error: (err) => console.error('Error al seguir:', err)
      });
    }
  }

  confirmarDejarSeguir() {
    if (!this.usuarioADejarSeguir?._id) return;

    this.perfilService.dejarSeguirUsuario(this.usuarioADejarSeguir._id).subscribe({
      next: (res) => {
        console.log(res.msg);
        this.siguiendo = false;
        this.usuario.seguidores = this.usuario.seguidores.filter((id: string) => id !== this.miId);
        this.modalVisible = false;
      },
      error: (err) => console.error('Error al dejar de seguir:', err)
    });
  }

  cancelarDejarSeguir() {
    this.modalVisible = false;
  }

  

  enviarSolicitudAmistad() {
    // TODO: implementar lógica de amistad
  }

}

