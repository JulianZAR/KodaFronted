import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type RolAsignable = 'NUTRITIONIST' | 'ADMIN';

export interface CuentaResponse {
  keycloakUserId: string;
  username: string;
  email: string;
  nombre: string;
  habilitado: boolean;
  roles: string[];
}

/** Administración de cuentas y roles (solo ADMIN). */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/admin/users`;

  listarCuentas(): Observable<CuentaResponse[]> {
    return this.http.get<CuentaResponse[]>(this.base);
  }

  asignarRol(keycloakUserId: string, rol: RolAsignable): Observable<void> {
    return this.http.put<void>(`${this.base}/${keycloakUserId}/roles/${rol}`, null);
  }

  quitarRol(keycloakUserId: string, rol: RolAsignable): Observable<void> {
    return this.http.delete<void>(`${this.base}/${keycloakUserId}/roles/${rol}`);
  }
}
