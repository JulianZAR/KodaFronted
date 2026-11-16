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

const TIPOS_REPORTE: Record<string, string> = {
  RESUMEN_NUTRICIONAL: 'Resumen nutricional',
};

export function etiquetaTipoReporte(tipo: string): string {
  return TIPOS_REPORTE[tipo] ?? tipo;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/reports`;

  /** POST /api/reports — genera un reporte con los datos actuales del usuario. */
  generarReporte(): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(this.base, {});
  }

  /** GET /api/reports — reportes del usuario, del más reciente al más antiguo. */
  consultarReportes(): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(this.base);
  }
}
