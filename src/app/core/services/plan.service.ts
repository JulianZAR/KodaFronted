import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Meta } from './usuario.service';

export interface PlanResponse {
  id: string;
  nombre: string;
  objetivo: Meta;
  descripcion: string;
  fechaAsignacion: string;
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/plans`;

  /** GET /api/plans/me — null si aún no tiene plan asignado (404). */
  obtenerMiPlan(): Observable<PlanResponse | null> {
    return this.http.get<PlanResponse>(`${this.base}/me`).pipe(
      catchError((err: unknown) =>
        err instanceof HttpErrorResponse && err.status === 404 ? of(null) : throwError(() => err),
      ),
    );
  }
}
