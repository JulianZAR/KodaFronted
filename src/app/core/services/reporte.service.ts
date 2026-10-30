import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReporteResponse {
  id: string;
  tipo: string;
  contenido: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/reports`;

  /** POST /api/reports — generate a new comprehensive nutrition report */
  generarReporte(): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(this.base, {});
  }

  /** GET /api/reports — fetch all historical reports for the authenticated user */
  consultarReportes(): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(this.base);
  }
}

