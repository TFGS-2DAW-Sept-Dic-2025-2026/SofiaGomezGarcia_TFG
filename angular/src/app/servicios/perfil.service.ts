import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { mapOneOrManyArgs } from "rxjs/internal/util/mapOneOrManyArgs";

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private apiUrl = 'http://localhost:5000/perfil';
  private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  auth = inject(AuthService);

  actualizarFavoritasPerfil(userId: string, idsFavoritas: string[]): Observable<any> {
    const token = this.auth.getSessionToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body = { favoritas: idsFavoritas };

    return this.http.put(`${this.apiUrl}/${userId}/favoritas`, body, { headers });
  }

  obtenerFavoritasPerfil(userId: string): Observable<any> {
    const token = this.auth.getSessionToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/${userId}/favoritas`, { headers });
  }

  obtenerListasPublicasPerfil(idUsuario: string): Observable<any> {
    const token = this.auth.getSessionToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(
      `${this.apiUrl}/${idUsuario}/listas-publicas`,
      { headers }
    );
  }

  actualizarListasPublicasPerfil(idUsuario: string, idsListas: string[]): Observable<any> {
    const token = this.auth.getSessionToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<any>(
      `${this.apiUrl}/${idUsuario}/listas-publicas`,
      { listasPublicas: idsListas },
      { headers }
    );
  }


  obtenerListaPublicaPorId(id: string) {
    return this.http.get<any>(`${this.baseUrl}/lista/publica/${id}`);
  }

  obtenerFavoritasPerfilPublico(username: string) {
    return this.http.get<any>(`${this.apiUrl}/publico/${username}/favoritas`);
  }

  obtenerSeguimientosPublicos(username: string) {
    return this.http.get<any[]>(`${this.apiUrl}/publico/${username}/seguimientos`);
  }

  obtenerOpinionesPublicas(username: string) {
  return this.http.get<{ opiniones: any[] }>(`${this.apiUrl}/publico/${username}/opiniones`)
    .pipe(
      map(res => res.opiniones || [])
    );
}

}