import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Meta =
  | 'PERDER_PESO'
  | 'MANTENER'
  | 'GANAR_MASA';

export interface PerfilResponse {
  id:            string;
  nombre:        string;
  email:         string;
  estaturaCm:    number | null;
  pesoKg:        number | null;
  meta:          Meta | null;
  fechaRegistro: string;
}

export interface ActualizarPerfilRequest {
  estaturaCm: number;
  meta:       Meta;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/users`;

  /** GET /api/users/me — fetch or provision the current user's profile. */
  obtenerPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.base}/me`);
  }

  /** PUT /api/users/me — update height and goal. */
  actualizarPerfil(data: ActualizarPerfilRequest): Observable<PerfilResponse> {
    return this.http.put<PerfilResponse>(`${this.base}/me`, data);
  }
}
