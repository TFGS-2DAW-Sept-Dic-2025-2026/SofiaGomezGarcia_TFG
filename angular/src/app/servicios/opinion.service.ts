import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OpinionService {

  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient, private auth: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.auth.getSessionToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerOpinionesSerie(idSerie: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/series/${idSerie}/opiniones`, { headers: this.getHeaders() });
  }

  guardarOpinionSerie(idSerie: string, opinion: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/series/${idSerie}/opiniones`, opinion, { headers: this.getHeaders() });
  }

  darMeGustaOpinion(idOpinion: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/opiniones/${idOpinion}/meGusta`, {}, { headers: this.getHeaders() });
  }

  obtenerOpinionesUsuario(idUsuario: string) {
    return this.http.get<any[]>(`${this.apiUrl}/opiniones/${idUsuario}`, { headers: this.getHeaders() });
  }

  getDiscover(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/series/descubrirNuevas`, { headers: this.getHeaders() });
  }

  getUltimasOpiniones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/opiniones/recientes`, {
      headers: this.getHeaders()
    });
  }

  getTopUsuarios() {
  return this.http.get<any[]>(`${this.apiUrl}/opiniones/topUsuarios`);
}

}