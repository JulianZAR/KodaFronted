import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegistrarProgresoRequest {
  pesoKg: number;
}

export interface ProgresoResponse {
  id: string;
  pesoKg: number;
  imc: number;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ProgresoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/progress`;

  /** POST /api/progress — register a new weight and calculate IMC. */
  registrar(data: RegistrarProgresoRequest): Observable<ProgresoResponse> {
    return this.http.post<ProgresoResponse>(this.base, data);
  }

  /** GET /api/progress — get history of progress. */
  consultarHistorial(): Observable<ProgresoResponse[]> {
    return this.http.get<ProgresoResponse[]>(this.base);
  }
}
