import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class seriesService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  getSeries(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtenerSeries?page=${page}`);
  }

  getSeriesByID(id: string): Observable<any> {
    return this.http.get(`http://localhost:5000/serie/${id}`);
  }


  getGeneros(): Observable<any> {
    return this.http.get(`${this.apiUrl}/series/generos`);
  }


  getProveedores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/series/proveedores`);
  }


  buscarSeries(filtros: any): Observable<any> {
    const page = filtros.page ? filtros.page : 1;

    let params = new HttpParams()
      .set('language', 'es-ES')
      .set('page', page);

    if (filtros.query) params = params.set('query', filtros.query);
    if (filtros.genero) params = params.set('with_genres', filtros.genero);
    if (filtros.idioma) params = params.set('with_original_language', filtros.idioma);
    if (filtros.plataforma) params = params.set('with_watch_providers', filtros.plataforma);

    return this.http.get(`${this.apiUrl}/series/descubrir`, { params });
  }

  getTemporada(idSerie: string, numeroTemporada: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/serie/${idSerie}/temporada/${numeroTemporada}`);
  }

  getTrailer(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/serie/${id}/trailer`);
  }

  getTrending() {
    return this.http.get<any>(`${this.apiUrl}/tendencias`);
  }


  getPopular() {
    return this.http.get<any[]>(`${this.apiUrl}/series/populares`);
  }

  

}