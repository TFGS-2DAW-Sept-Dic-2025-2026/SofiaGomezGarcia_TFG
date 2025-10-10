import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class seriesService {
  private apiUrl = 'http://localhost:5000'; 

  constructor(private http: HttpClient) {}

  getSeries(page: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/obtenerSeries?page=${page}`);
  }

  getSeriesByID(id: string): Observable<any> {
    return this.http.get(`http://localhost:5000/serie/${id}`);
  }
}