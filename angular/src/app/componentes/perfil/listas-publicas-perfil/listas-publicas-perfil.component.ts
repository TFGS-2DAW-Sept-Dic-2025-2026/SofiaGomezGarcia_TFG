import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
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
export class ListasPublicasPerfilComponent implements OnInit{
  @Input() usuario!: any;
  @Input() esMiPerfil = false;

  auth = inject(AuthService);
  perfilService = inject(PerfilService);
  listasService = inject(ListasService);

  listasPublicas: any[] = [];
  listasUsuario: any[] = [];
  modalAbierto = false;

  ngOnInit(): void {
    this.cargarListasPublicas();
  }

  constructor(private router: Router) {}

  cargarListasPublicas() {
    this.perfilService.obtenerListasPublicasPerfil(this.usuario.id).subscribe({
      next: (res) => this.listasPublicas = res.listasPublicas || [],
      error: (err) => console.error('Error al cargar listas públicas:', err)
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
    const ids = this.listasUsuario
      .filter(l => l.seleccionada)
      .map(l => l._id);

    this.perfilService.actualizarListasPublicasPerfil(this.usuario.id, ids).subscribe({
      next: () => {
        this.cargarListasPublicas();
        this.cerrarModal();
      },
      error: (err) => console.error('Error al actualizar listas públicas:', err)
    });
  }


  //para ir a la lista que seleccione el usuario (mirar como mejorarlo)

  verLista(idLista: string) {
  console.log('ID de la lista clicada:', idLista); 
  if (idLista) {
    this.router.navigate(['/listas', idLista]);
  } else {
    console.error('El ID de la lista es inválido');
  }
}

}
