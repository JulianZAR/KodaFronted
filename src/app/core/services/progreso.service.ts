import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImcCategoria } from './imc.service';

export interface RegistrarProgresoRequest {
  pesoKg: number;
}

export interface ProgresoResponse {
  id: string;
  pesoKg: number;
  imc: number;
  categoria: ImcCategoria;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ProgresoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/progress`;

  /** POST /api/progress — registra un pesaje; el backend calcula su IMC y categoría. */
  registrar(data: RegistrarProgresoRequest): Observable<ProgresoResponse> {
    return this.http.post<ProgresoResponse>(this.base, data);
  }

  /** GET /api/progress — historial, del más reciente al más antiguo. */
  consultarHistorial(): Observable<ProgresoResponse[]> {
    return this.http.get<ProgresoResponse[]>(this.base);
  }
}
