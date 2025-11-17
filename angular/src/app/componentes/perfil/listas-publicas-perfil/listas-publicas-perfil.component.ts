import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../servicios/auth.service';
import { PerfilService } from '../../../servicios/perfil.service';
import { ListasService } from '../../../servicios/listas.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-listas-publicas-perfil',
  imports: [CommonModule, FormsModule],
  templateUrl: './listas-publicas-perfil.component.html',
  styleUrl: './listas-publicas-perfil.component.css'
})
export class ListasPublicasPerfilComponent implements OnChanges {

  @Input() usuario!: any;
  @Input() esMiPerfil = false;

  private auth = inject(AuthService);
  private perfilService = inject(PerfilService);
  private listasService = inject(ListasService);
  private router = inject(Router);

  listasPublicas: any[] = [];
  listasUsuario: any[] = [];
  modalAbierto = false;

  ngOnChanges(): void {
    if (this.usuario?.username) {
      this.cargarListasPublicas();
    }
  }

  cargarListasPublicas() {
    if (!this.usuario) return;

    const idUsuario = this.usuario.id || this.usuario._id;
    const username = this.usuario.username;

    const observable = this.esMiPerfil
      ? this.perfilService.obtenerListasPublicasPerfil(idUsuario)
      : this.listasService.obtenerListasPublicasPorUsername(username);

    observable.subscribe({
      next: (res) => {
        this.listasPublicas = res?.listasPublicas || [];
      },
      error: (err) => {
        console.error('Error al cargar listas públicas:', err);
      }
    });
  }

  abrirModalListas() {
    this.listasService.getListas().subscribe({
      next: (listas) => {
        this.listasUsuario = listas.map(lista => ({
          ...lista,
          seleccionada: this.listasPublicas.some(pub => pub._id === lista._id)
        }));
        this.modalAbierto = true;
      },
      error: (err) => console.error('Error al obtener listas del usuario:', err)
    });
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  toggleSeleccion(lista: any) {
    lista.seleccionada = !lista.seleccionada;
  }

  guardarListasPublicas() {
    const idsSeleccionadas = this.listasUsuario
      .filter(l => l.seleccionada)
      .map(l => l._id);

    const idUsuario = this.usuario.id || this.usuario._id;

    this.perfilService.actualizarListasPublicasPerfil(idUsuario, idsSeleccionadas)
      .subscribe({
        next: () => {
          this.cargarListasPublicas();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar listas públicas:', err)
      });
  }

  verLista(idLista: string) {
    if (!idLista) {
      console.error('El ID de la lista es inválido');
      return;
    }

    this.router.navigate(['/listas', idLista], { queryParams: { publica: true } });
  }

}