import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { seriesService } from '../../servicios/series.service';
import { ListasService } from '../../servicios/listas.service';
import { forkJoin } from 'rxjs';
import { LayoutComponent } from '../layout/layout.component';
import { PerfilService } from '../../servicios/perfil.service';
import { UsuariosService } from '../../servicios/usuarios.service';

@Component({
  selector: 'app-lista-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  templateUrl: './lista-detalle.component.html',
  styleUrls: ['./lista-detalle.component.css']
})
export class ListaDetalleComponent implements OnInit {
  auth = inject(AuthService);
  listasService = inject(ListasService);
  seriesService = inject(seriesService);
  perfilService = inject(PerfilService);
  usuariosService = inject(UsuariosService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isLoggedIn = false;
  esPublica = false;
  lista: any = null;
  loading = true;

  userId = '';
  dioLike = false;

  ngOnInit() {
    this.isLoggedIn = this.auth.hasValidSession();
    if (this.isLoggedIn) {
      this.userId = this.auth.getUserIdFromToken(); 
    }

    const idLista = this.route.snapshot.paramMap.get('id');
    this.esPublica = this.route.snapshot.queryParamMap.get('publica') === 'true';

    if (idLista) this.cargarLista(idLista, this.esPublica);
  }

  cargarLista(idLista: string, esPublica: boolean) {
    this.loading = true;

    const observable = esPublica
      ? this.perfilService.obtenerListaPublicaPorId(idLista)
      : this.listasService.obtenerListaPorId(idLista);

    observable.subscribe({
      next: (res) => {
        this.lista = res;

        // Inicializar likes si no existen
        this.lista.likes ??= 0;
        this.lista.usuariosQueDieronLike ??= [];

        // Verificar si el usuario ya dio like
        if (this.userId) this.dioLike = this.lista.usuariosQueDieronLike.includes(this.userId);

        if (this.lista.usuarioCreador) {
          this.usuariosService.obtenerUsuarioPorID(this.lista.usuarioCreador).subscribe({
            next: (usuario) => this.lista.usuario = usuario,
            error: (err) => {
              console.error('Error cargando usuario creador:', err);
              this.lista.usuario = { username: 'Usuario', fotoPerfil: '' };
            }
          });
        }

        // Cargar series completas
        if (this.lista.series?.length) {
          const observablesSeries = this.lista.series.map((serieId: string) =>
            this.seriesService.getSeriesByID(serieId)
          );

          forkJoin(observablesSeries).subscribe({
            next: (seriesCompletas) => {
              this.lista.series = seriesCompletas;
              this.loading = false;
            },
            error: (err) => {
              console.error('Error cargando series por id:', err);
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error cargando lista:', err);
        this.loading = false;
      }
    });
  }

  eliminarSerie(idSerie: string) {
    if (!this.lista?._id) return;

    this.listasService.eliminarSerieDeLista(this.lista._id, idSerie).subscribe({
      next: (listaActualizada) => {
        this.lista.series = listaActualizada.series;

        if (this.lista.series.length) {
          const observables = this.lista.series.map((serieId: string) =>
            this.seriesService.getSeriesByID(serieId)
          );

          forkJoin(observables).subscribe({
            next: (seriesCompletas) => (this.lista.series = seriesCompletas),
            error: (err) => console.error('Error recargando series:', err)
          });
        }
      },
      error: (err) => console.error('Error al eliminar serie:', err)
    });
  }

  toggleLike() {
    if (!this.lista?._id || !this.userId) return;

    this.listasService.darLike(this.lista._id).subscribe({
      next: (res) => {
        this.lista.likes = res.likes;
        this.dioLike = res.dioLike;
      },
      error: (err) => console.error("Error al dar like:", err)
    });
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
