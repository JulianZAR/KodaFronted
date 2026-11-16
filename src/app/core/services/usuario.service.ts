import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Mismos valores que el enum Meta del backend. */
export type Meta = 'PERDER_PESO' | 'GANAR_MASA' | 'MANTENER' | 'MEJORAR_HABITOS';

export const METAS: { valor: Meta; label: string; corto: string }[] = [
  { valor: 'PERDER_PESO', label: 'Perder peso / Reducir grasa', corto: 'Déficit calórico' },
  { valor: 'MANTENER', label: 'Mantener peso actual', corto: 'Mantenimiento' },
  { valor: 'GANAR_MASA', label: 'Aumentar masa muscular', corto: 'Superávit / Masa' },
  { valor: 'MEJORAR_HABITOS', label: 'Mejorar hábitos saludables', corto: 'Hábitos saludables' },
];

export function etiquetaMeta(meta: string | null | undefined, corto = false): string {
  const encontrada = METAS.find(m => m.valor === meta);
  if (!encontrada) return meta || 'Sin definir';
  return corto ? encontrada.corto : encontrada.label;
}

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
  meta: Meta | null;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/users`;

  /** GET /api/users/me — el backend crea el perfil en la primera petición. */
  obtenerPerfil(): Observable<PerfilResponse> {
    return this.http.get<PerfilResponse>(`${this.base}/me`);
  }

  /** PUT /api/users/me — estatura y meta (el peso se registra en /api/progress). */
  actualizarPerfil(data: ActualizarPerfilRequest): Observable<PerfilResponse> {
    return this.http.put<PerfilResponse>(`${this.base}/me`, data);
  }
}
