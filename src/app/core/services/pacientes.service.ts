import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImcCategoria } from './imc.service';
import { Meta } from './usuario.service';
import { PlanResponse } from './plan.service';
import { ProgresoResponse } from './progreso.service';
import { ReporteResponse } from './reporte.service';

export interface PacienteResponse {
  id: string;
  nombre: string;
  email: string;
  estaturaCm: number | null;
  pesoKg: number | null;
  meta: Meta | null;
  imc: number | null;
  categoriaImc: ImcCategoria | null;
  plan: PlanResponse | null;
  fechaRegistro: string;
}

export interface AsignarPlanRequest {
  nombre: string;
  objetivo: Meta;
  descripcion: string;
}

/** Endpoints para NUTRITIONIST y ADMIN sobre otros usuarios. */
@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listar(): Observable<PacienteResponse[]> {
    return this.http.get<PacienteResponse[]>(`${this.api}/api/users`);
  }

  obtener(usuarioId: string): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.api}/api/users/${usuarioId}`);
  }

  historial(usuarioId: string): Observable<ProgresoResponse[]> {
    return this.http.get<ProgresoResponse[]>(`${this.api}/api/progress/${usuarioId}`);
  }

  asignarPlan(usuarioId: string, plan: AsignarPlanRequest): Observable<PlanResponse> {
    return this.http.post<PlanResponse>(`${this.api}/api/plans/${usuarioId}`, plan);
  }

  reportes(usuarioId: string): Observable<ReporteResponse[]> {
    return this.http.get<ReporteResponse[]>(`${this.api}/api/reports/${usuarioId}`);
  }

  generarReporte(usuarioId: string): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(`${this.api}/api/reports/${usuarioId}`, {});
  }
}
