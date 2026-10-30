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
  valor: number;
  categoria: ImcCategoria;
}

export interface CalcularImcRequest {
  pesoKg: number;
  estaturaCm: number;
}

export const IMC_META: Record<ImcCategoria, {
  label: string;
  badgeClass: string;
  colorHex: string;
  description: string;
}> = {
  BAJO_PESO: {
    label: 'Bajo peso',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    colorHex: '#3b82f6',
    description: 'Tu peso está por debajo de lo recomendado. Consulta con un nutricionista para alcanzar un peso saludable.',
  },
  PESO_NORMAL: {
    label: 'Normal',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    colorHex: '#10b981',
    description: 'Tu IMC está dentro del rango considerado saludable. ¡Excelente trabajo manteniendo tus hábitos!',
  },
  SOBREPESO: {
    label: 'Sobrepeso',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    colorHex: '#f59e0b',
    description: 'Tu IMC indica un ligero sobrepeso. Pequeños cambios en alimentación y actividad física marcarán la diferencia.',
  },
  OBESIDAD_I: {
    label: 'Obesidad I',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    colorHex: '#f97316',
    description: 'Presentas obesidad grado I. Es recomendable un plan nutricional estructurado con seguimiento profesional.',
  },
  OBESIDAD_II: {
    label: 'Obesidad II',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    colorHex: '#f43f5e',
    description: 'Presentas obesidad grado II. Te sugerimos consultar a un especialista para una evaluación detallada.',
  },
  OBESIDAD_III: {
    label: 'Obesidad III',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    colorHex: '#ef4444',
    description: 'Presentas obesidad grado III. Prioriza la atención médica y nutricional integral.',
  },
};

@Injectable({ providedIn: 'root' })
export class ImcService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/imc`;

  /** GET /api/imc/me — returns current calculated IMC based on latest saved weight and height */
  miImcActual(): Observable<ImcResponse> {
    return this.http.get<ImcResponse>(`${this.base}/me`);
  }

  /** Calculates local IMC client-side fallback if offline */
  calcularLocal(pesoKg: number, estaturaCm: number): ImcResponse {
    const estaturaM = estaturaCm / 100;
    const valor = parseFloat((pesoKg / (estaturaM * estaturaM)).toFixed(1));
    let categoria: ImcCategoria = 'PESO_NORMAL';

    if (valor < 18.5) {
      categoria = 'BAJO_PESO';
    } else if (valor < 25.0) {
      categoria = 'PESO_NORMAL';
    } else if (valor < 30.0) {
      categoria = 'SOBREPESO';
    } else if (valor < 35.0) {
      categoria = 'OBESIDAD_I';
    } else if (valor < 40.0) {
      categoria = 'OBESIDAD_II';
    } else {
      categoria = 'OBESIDAD_III';
    }

    return { valor, categoria };
  }
}
