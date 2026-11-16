import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Mismas categorías que CategoriaImc del backend (rangos OMS). */
export type ImcCategoria = 'BAJO_PESO' | 'NORMAL' | 'SOBREPESO' | 'OBESIDAD';

export interface ImcResponse {
  valor: number;
  categoria: ImcCategoria;
}

export interface CalcularImcRequest {
  pesoKg: number;
  estaturaCm: number;
}

export interface ImcInfo {
  label: string;
  badgeClass: string;
  colorHex: string;
  description: string;
}

export const IMC_META: Record<ImcCategoria, ImcInfo> = {
  BAJO_PESO: {
    label: 'Bajo peso',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    colorHex: '#3b82f6',
    description: 'Tu peso está por debajo de lo recomendado. Consulta con un nutricionista para alcanzar un peso saludable.',
  },
  NORMAL: {
    label: 'Normal',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    colorHex: '#10b981',
    description: 'Tu IMC está dentro del rango considerado saludable. ¡Excelente trabajo manteniendo tus hábitos!',
  },
  SOBREPESO: {
    label: 'Sobrepeso',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    colorHex: '#f59e0b',
    description: 'Tu IMC indica sobrepeso. Pequeños cambios en alimentación y actividad física marcarán la diferencia.',
  },
  OBESIDAD: {
    label: 'Obesidad',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    colorHex: '#f43f5e',
    description: 'Tu IMC está en rango de obesidad. Es recomendable un plan nutricional con seguimiento profesional.',
  },
};

/** Información visual de una categoría; null si viene vacía o es desconocida. */
export function infoImc(categoria: string | null | undefined): ImcInfo | null {
  return categoria && categoria in IMC_META ? IMC_META[categoria as ImcCategoria] : null;
}

/** El IMC siempre lo calcula el backend (CalculadoraIMC); aquí solo se consulta. */
@Injectable({ providedIn: 'root' })
export class ImcService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/imc`;

  /** GET /api/imc/me — IMC con el peso y la estatura guardados (409 si el perfil está incompleto). */
  miImcActual(): Observable<ImcResponse> {
    return this.http.get<ImcResponse>(`${this.base}/me`);
  }

  /** POST /api/imc — calcula un IMC sin guardar nada. */
  calcular(data: CalcularImcRequest): Observable<ImcResponse> {
    return this.http.post<ImcResponse>(this.base, data);
  }
}
