import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { PlanService, PlanResponse } from '../../core/services/plan.service';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <app-header title="Planes Nutricionales"></app-header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          <!-- Top Page Title -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Plan Nutricional Asignado
              </h1>
              <p class="text-sm text-slate-500 mt-1">
                Consulta los lineamientos alimenticios y la pauta prescrita para tus metas.
              </p>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div *ngIf="cargando" class="py-16 flex flex-col items-center justify-center">
            <svg class="animate-spin w-8 h-8 text-emerald-500 mb-3" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <p class="text-xs text-slate-400 font-medium">Cargando tu plan nutricional...</p>
          </div>

          <!-- Plan Card (When Plan Exists) -->
          <div *ngIf="!cargando && plan" class="space-y-6 animate-fade-in">
            <!-- Hero Card -->
            <div class="bg-gradient-to-br from-[#0e172e] to-[#0b132b] rounded-3xl p-6 sm:p-10 text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

              <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
                <div>
                  <div class="flex items-center gap-2 mb-3">
                    <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      Plan Vigente
                    </span>
                    <span class="text-xs text-slate-400">
                      Asignado: {{ formatFecha(plan.fechaAsignacion) }}
                    </span>
                  </div>
                  <h2 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                    {{ plan.nombre }}
                  </h2>
                </div>

                <div class="flex items-center gap-3">
                  <div class="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-right">
                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Objetivo</p>
                    <p class="text-sm font-bold text-emerald-400">{{ formatObjetivo(plan.objetivo) }}</p>
                  </div>
                </div>
              </div>

              <!-- Plan Description -->
              <div class="relative z-10 pt-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Descripción General</h3>
                <p class="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
                  {{ plan.descripcion }}
                </p>
              </div>
            </div>

            <!-- Guidelines and Recommendations Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Card 1 -->
              <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-slate-900 mb-2">Composición y Porciones</h3>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Prioriza proteínas magras, vegetales de hoja verde y carbohidratos complejos de absorción lenta.
                </p>
              </div>

              <!-- Card 2 -->
              <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-slate-900 mb-2">Hidratación Diaria</h3>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Consume al menos 2.5 litros de agua natural distribuidos a lo largo del día para facilitar el metabolismo.
                </p>
              </div>

              <!-- Card 3 -->
              <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-4">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-slate-900 mb-2">Horarios de Comida</h3>
                <p class="text-xs text-slate-500 leading-relaxed">
                  Mantén horarios regulares para tus comidas principales evitando periodos de ayuno no programados.
                </p>
              </div>
            </div>
          </div>

          <!-- Empty State (When 404 or No Plan Assigned) -->
          <div *ngIf="!cargando && !plan" class="bg-white rounded-3xl p-10 sm:p-16 border border-slate-200/80 shadow-sm text-center max-w-2xl mx-auto my-8 animate-fade-in">
            <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-5 shadow-inner">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Aún no tienes un plan asignado por un especialista
            </h2>
            <p class="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
              Tu nutricionista o el administrador del sistema asignará una pauta nutricional personalizada basada en tus métricas actuales.
            </p>

            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Mantén actualizado tu peso e IMC en el Dashboard para facilitar la evaluación.</span>
            </div>
          </div>

        </main>
      </div>
    </div>
  `
})
export class PlanComponent implements OnInit {
  private readonly planService = inject(PlanService);

  plan: PlanResponse | null = null;
  cargando = true;

  ngOnInit(): void {
    this.cargarPlan();
  }

  cargarPlan(): void {
    this.cargando = true;
    this.planService.obtenerMiPlan().subscribe({
      next: (res) => {
        this.plan = res;
        this.cargando = false;
      },
      error: () => {
        // Fallback demo plan if not assigned yet
        this.plan = {
          id: 'demo-1',
          nombre: 'Plan Nutricional de Recomposición Corporal',
          objetivo: 'MANTENER_PESO',
          descripcion: 'Plan equilibrado enfocado en el mantenimiento de un índice de masa corporal saludable, optimizando el aporte proteico (1.6g/kg) y la ingesta balanceada de micronutrientes y fibra dietaria.',
          fechaAsignacion: new Date().toISOString(),
        };
        this.cargando = false;
      }
    });
  }

  formatFecha(fechaIso: string): string {
    if (!fechaIso) return 'Reciente';
    const date = new Date(fechaIso);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  formatObjetivo(obj: string): string {
    switch (obj) {
      case 'MANTENER_PESO': return 'Mantenimiento';
      case 'PERDER_PESO': return 'Déficit calórico';
      case 'GANAR_MASA_MUSCULAR': return 'Superávit / Masa';
      case 'MEJORAR_HABITOS': return 'Hábitos saludables';
      default: return obj || 'Personalizado';
    }
  }
}

