import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { seriesService } from './series.service';



@Injectable({
    providedIn: 'root'
})
export class ActividadService {
    private http = inject(HttpClient);
    private auth = inject(AuthService);
    private seriesService = inject(seriesService);

    private apiUrl = 'http://localhost:5000';

    obtenerUsuariosSeguidos(usuarioId: string): Observable<any[]> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.auth.getSessionToken()}`
        });
        return this.http.get<any[]>(`${this.apiUrl}/perfil/seguidos/${usuarioId}`, { headers });
    }

    
    
}