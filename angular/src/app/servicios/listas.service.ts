import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ListasService {
  private apiUrl = 'http://localhost:5000/listas';
  private baseUrl = 'http://localhost:5000';
  private auth = inject(AuthService);

  constructor(private http: HttpClient) { }


  private getHeaders(): HttpHeaders {
    const token = this.auth.getSessionToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }


  getListas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }


  crearLista(nombre: string, descripcion?: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      { nombre, descripcion },
      { headers: this.getHeaders() }
    );
  }


  agregarSerieALista(idLista: string, idSerie: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${idLista}/agregar`,
      { idSerie },
      { headers: this.getHeaders() }
    );
  }


  eliminarSerieDeLista(idLista: string, idSerie: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${idLista}/eliminar`,
      { idSerie },
      { headers: this.getHeaders() }
    );
  }


  eliminarLista(idLista: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${idLista}`,
      { headers: this.getHeaders() }
    );
  }

  obtenerListaPorId(idLista: string) {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/${idLista}`, { headers });
  }


  getListasConEstado(idSerie: string) {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/conEstado/${idSerie}`, { headers });
  }

  obtenerListasPublicasPorUsername(username: string) {
    return this.http.get<any>(`${this.baseUrl}/usuarios/${username}/listasPublicas`);
  }

  darLike(idLista: string) {
    const headers = this.getHeaders();
    return this.http.post<any>(
      `${this.apiUrl}/${idLista}/like`,
      {},
      { headers }
    );
  }


  getListasPublicasPopulares() {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/listas/publicas/populares`, { headers });
  }


}