import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlanResponse {
  id: string;
  nombre: string;
  objetivo: string;
  descripcion: string;
  fechaAsignacion: string;
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/plans`;

  /** GET /api/plans/me — fetch active plan for the authenticated user */
  obtenerMiPlan(): Observable<PlanResponse> {
    return this.http.get<PlanResponse>(`${this.base}/me`);
  }
}

