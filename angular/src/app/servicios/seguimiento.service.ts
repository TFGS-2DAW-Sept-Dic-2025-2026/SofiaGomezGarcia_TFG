import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private url = 'http://localhost:5000/seguimiento';
  auth = inject(AuthService);

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getSessionToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getSeguimientos(): Observable<any> {
    return this.http.get(this.url, { headers: this.getHeaders() });
  }

  agregarSeguimiento(serie: any): Observable<any> {
    return this.http.post(this.url, serie, { headers: this.getHeaders() });
  }

  actualizarSeguimiento(idSerieTMDB: string, data: any): Observable<any> {
    return this.http.patch(`${this.url}/${idSerieTMDB}`, data, { headers: this.getHeaders() });
  }

  eliminarSeguimiento(idSerieTMDB: string): Observable<any> {
    return this.http.delete(`${this.url}/${idSerieTMDB}`, { headers: this.getHeaders() });
  }
}