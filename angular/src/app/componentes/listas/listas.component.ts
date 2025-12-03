import { Component, effect, inject } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { seriesService } from '../../servicios/series.service';
import { ListasService } from '../../servicios/listas.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'app-listas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LayoutComponent],
  templateUrl: './listas.component.html',
  styleUrl: './listas.component.css'
})
export class ListasComponent {
  auth = inject(AuthService);
  servicioSeries = inject(seriesService);
  listasService = inject(ListasService);

  isLoggedIn = false;
  listas: any[] = [];
  loading = false;


  nuevaLista = {
    nombre: '',
    descripcion: ''
  };

  constructor() {

    if (this.auth.hasValidSession()) {
      this.loadListas();
    }


    effect(() => {
      this.isLoggedIn = this.auth.hasValidSession();
      if (this.isLoggedIn) {
        this.loadListas();
      } else {
        this.listas = [];
      }
    });
  }


  loadListas() {
    this.loading = true;
    this.listasService.getListas().subscribe({
      next: (res) => {
        this.listas = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener listas', err);
        this.loading = false;
      }
    });
  }


  crearLista() {
  const { nombre, descripcion } = this.nuevaLista;

  if (!nombre.trim()) return;

  this.listasService.crearLista(nombre, descripcion).subscribe({
    next: (nueva) => {
      this.listas.push(nueva);

      this.nuevaLista = { nombre: '', descripcion: '' };

      this.cerrarModal();
    },
    error: (err) => {
      console.error('Error al crear lista', err);
    }
  });
}


  eliminarLista(idLista: string) {
    if (!confirm('¿Seguro que quieres eliminar esta lista?')) return; 

    this.listasService.eliminarLista(idLista).subscribe({
      next: () => {
        this.listas = this.listas.filter(l => l._id !== idLista);
      },
      error: (err) => {
        console.error('Error al eliminar lista', err);
      }
    });
  }

  mostrarModal = false;

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }


}