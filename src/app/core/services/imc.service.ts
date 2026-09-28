import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ImcCategoria =
  | 'BAJO_PESO'
  | 'PESO_NORMAL'
  | 'SOBREPESO'
  | 'OBESIDAD_I'
  | 'OBESIDAD_II'
  | 'OBESIDAD_III';

export interface ImcResponse {
  valor:     number;
  categoria: ImcCategoria;
}

export interface CalcularImcRequest {
  pesoKg:     number;
  estaturaCm: number;
}

/** Human-readable labels and badge class for each IMC category. */
export const IMC_META: Record<ImcCategoria, { label: string; badge: string }> = {
  BAJO_PESO:         { label: 'Bajo peso',       badge: 'badge-yellow' },
  PESO_NORMAL:       { label: 'Peso normal',      badge: 'badge-green'  },
  SOBREPESO:         { label: 'Sobrepeso',        badge: 'badge-yellow' },
  OBESIDAD_I:        { label: 'Obesidad I',       badge: 'badge-red'    },
  OBESIDAD_II:       { label: 'Obesidad II',      badge: 'badge-red'    },
  OBESIDAD_III:      { label: 'Obesidad III',     badge: 'badge-red'    },
};

@Injectable({ providedIn: 'root' })
export class ImcService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/imc`;

  /** GET /api/imc/me — calculate IMC using saved profile data. */
  miImcActual(): Observable<ImcResponse> {
    return this.http.get<ImcResponse>(`${this.base}/me`);
  }

  /** POST /api/imc — calculate IMC from arbitrary values. */
  calcular(data: CalcularImcRequest): Observable<ImcResponse> {
    return this.http.post<ImcResponse>(this.base, data);
  }
}
