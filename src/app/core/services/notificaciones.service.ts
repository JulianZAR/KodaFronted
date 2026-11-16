import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TipoNotificacion =
  | 'PLAN_ASIGNADO'
  | 'PLAN_ACTUALIZADO'
  | 'REPORTE_GENERADO'
  | 'ROL_ASIGNADO'
  | 'ROL_RETIRADO';

export interface NotificacionResponse {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

/** A qué pantalla lleva cada tipo de notificación al hacer clic. */
export const RUTA_NOTIFICACION: Record<TipoNotificacion, string> = {
  PLAN_ASIGNADO: '/plan',
  PLAN_ACTUALIZADO: '/plan',
  REPORTE_GENERADO: '/reportes',
  ROL_ASIGNADO: '/inicio',
  ROL_RETIRADO: '/inicio',
};

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/notifications`;

  listar(): Observable<NotificacionResponse[]> {
    return this.http.get<NotificacionResponse[]>(this.base);
  }

  marcarLeida(id: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/read`, null);
  }

  marcarTodasLeidas(): Observable<void> {
    return this.http.post<void>(`${this.base}/read-all`, null);
  }
}
