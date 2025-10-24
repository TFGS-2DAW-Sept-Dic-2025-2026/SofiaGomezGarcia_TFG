import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../servicios/usuarios.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { ActividadPerfilComponent } from '../perfil/actividad-perfil/actividad-perfil.component';
import { ListasPublicasPerfilComponent } from '../perfil/listas-publicas-perfil/listas-publicas-perfil.component';

@Component({
  selector: 'app-perfil-externo',
  imports: [FormsModule, CommonModule, LayoutComponent, ActividadPerfilComponent, ListasPublicasPerfilComponent],
  templateUrl: './perfil-externo.component.html',
  styleUrl: './perfil-externo.component.css'
})
export class PerfilExternoComponent implements OnInit{
  usuario: any;
  loading = true;

  route = inject(ActivatedRoute);
  usuarioService = inject(UsuariosService);

 

  ngOnInit(): void {
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
      },
      error: (err) => {
        console.error('Error cargando usuario externo:', err);
        this.loading = false;
      }
    });
  }

  enviarSolicitudAmistad() {
    // TODO: implementar lógica de amistad
  }

} 

