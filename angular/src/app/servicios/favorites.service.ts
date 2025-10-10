import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private url = 'http://localhost:5000/favoritas';

  constructor(private http: HttpClient) { }

  auth = inject(AuthService);

  toggleFavorite(serieId: string): Observable<any> {
    const token = this.auth.getSessionToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${this.url}/${serieId}`, {}, { headers });
  }

  getFavorites(): Observable<any> {
    const token = this.auth.getSessionToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get(this.url, { headers });
  }
}