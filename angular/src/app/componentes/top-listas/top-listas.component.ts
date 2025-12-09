import { Component, inject, OnInit } from '@angular/core';
import { LayoutComponent } from '../layout/layout.component';
import { AuthService } from '../../servicios/auth.service';
import { ListasService } from '../../servicios/listas.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-listas',
  imports: [RouterModule, CommonModule,LayoutComponent],
  templateUrl: './top-listas.component.html',
  styleUrl: './top-listas.component.css'
})
export class TopListasComponent implements OnInit {
  auth = inject(AuthService);
  listasService = inject(ListasService);
  router = inject(Router);

  listasPopulares: any[] = [];

  ngOnInit() {
    this.cargarTopListas();
  }

  cargarTopListas() {
    this.listasService.getListasPublicasPopulares().subscribe({
      next: res => {
        this.listasPopulares = res.slice(0, 50); 
      },
      error: err => console.error('Error cargando listas públicas populares', err)
    });
  }

  verLista(idLista: string) {
    if (!idLista) return;
    this.router.navigate(['/listas', idLista], { queryParams: { publica: true } });
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
}