import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Meta =
  | 'MANTENER_PESO'
  | 'PERDER_PESO'
  | 'GANAR_MASA_MUSCULAR'
  | 'MEJORAR_HABITOS';

export interface PerfilResponse {
  id: string;
  nombre: string;
  email: string;
  estaturaCm: number | null;
  pesoKg: number | null;
  meta: Meta | null;
  fechaRegistro: string;
}

export interface ActualizarPerfilRequest {
  estaturaCm: number;
  meta: Meta;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/users`;
  private readonly fallbackBase = `${environment.apiUrl}/api/usuario`;

  /** GET /api/users/me with fallback to /api/usuario/me */
  obtenerPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.base}/me`).pipe(
      catchError(() => this.http.get<PerfilResponse>(`${this.fallbackBase}/me`))
    );
  }

  /** PUT /api/users/me with fallback to /api/usuario/perfil */
  actualizarPerfil(data: ActualizarPerfilRequest): Observable<PerfilResponse> {
    return this.http.put<PerfilResponse>(`${this.base}/me`, data).pipe(
      catchError(() => this.http.put<PerfilResponse>(`${this.fallbackBase}/perfil`, data))
    );
  }
}
