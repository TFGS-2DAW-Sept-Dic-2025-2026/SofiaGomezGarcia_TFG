import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private apiUrl = 'http://localhost:5000'; 

  auth = inject(AuthService);

  constructor(private http: HttpClient) { }

  // Obtener todos los usuarios
  obtenerUsuarios(): Observable<any> {
    const token = this.auth.getSessionToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/usuarios`, { headers });
  }

  obtenerUsuarioPorID(idUsuario: string): Observable<any> {
    const token = this.auth.getSessionToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/usuarios/${idUsuario}`, { headers });
  }

  obtenerUsuarioPorUsername(username: string): Observable<any> {
    const token = this.auth.getSessionToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/${username}/username`, { headers });
  }

}