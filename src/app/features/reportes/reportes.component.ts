import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ReporteService, ReporteResponse } from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <app-header title="Reportes Nutricionales"></app-header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          <!-- Top Page Title & Generator Button -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Reportes Nutricionales
              </h1>
              <p class="text-sm text-slate-500 mt-1">
                Genera y consulta resúmenes analíticos estructurados de tu evolución física.
              </p>
            </div>

            <div>
              <button
                type="button"
                (click)="generarNuevoReporte()"
                [disabled]="generando"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-60"
              >
                <svg *ngIf="!generando" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <svg *ngIf="generando" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{{ generando ? 'Generando Reporte...' : '+ Generar Nuevo Reporte' }}</span>
              </button>
            </div>
          </div>

          <!-- Alert Banner -->
          <div *ngIf="mensajeExito" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ mensajeExito }}</span>
          </div>

          <!-- Reports List Container -->
          <div class="space-y-4">
            <div *ngFor="let reporte of reportes" class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm transition hover:shadow-md">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      {{ reporte.tipo }}
                    </span>
                    <h3 class="text-base font-bold text-slate-900 mt-1">
                      Reporte de Evaluación Nutricional
                    </h3>
                  </div>
                </div>

                <div class="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <polyline points="12 6 12 12 16 14" stroke-width="2"/>
                  </svg>
                  <span>{{ formatFecha(reporte.fecha) }}</span>
                </div>
              </div>

              <!-- Report Structured Content -->
              <div class="pt-4 text-xs sm:text-sm text-slate-600 leading-relaxed font-mono bg-slate-50/70 p-4 rounded-2xl border border-slate-100 mt-4 whitespace-pre-wrap">
                {{ reporte.contenido }}
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="reportes.length === 0 && !cargando" class="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-xl mx-auto my-8">
              <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-1">Aún no hay reportes generados</h3>
              <p class="text-xs text-slate-500 mb-6">
                Haz clic en el botón superior para compilar un análisis automático de tus registros y métricas de IMC.
              </p>
              <button
                type="button"
                (click)="generarNuevoReporte()"
                class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition"
              >
                Generar mi primer reporte
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  `
})
export class ReportesComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);

  reportes: ReporteResponse[] = [];
  cargando = true;
  generando = false;
  mensajeExito = '';

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.cargando = true;
    this.reporteService.consultarReportes().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.reportes = data;
        } else {
          this.reportes = this.getMockReportes();
        }
        this.cargando = false;
      },
      error: () => {
        this.reportes = this.getMockReportes();
        this.cargando = false;
      }
    });
  }

  generarNuevoReporte(): void {
    this.generando = true;
    this.mensajeExito = '';

    this.reporteService.generarReporte().subscribe({
      next: (nuevo) => {
        this.generando = false;
        this.mensajeExito = '¡Nuevo reporte nutricional generado con éxito!';
        this.reportes.unshift(nuevo);
        setTimeout(() => this.mensajeExito = '', 4000);
      },
      error: () => {
        // Fallback demo generation for offline preview
        this.generando = false;
        const nuevoMock: ReporteResponse = {
          id: 'rep-' + Date.now(),
          tipo: 'PROGRESO_GENERAL',
          contenido: `=== INFORME NUTRICIONAL NUTRIGO ===\nFecha: ${new Date().toLocaleString()}\nEstado Actual: IMC 22.3 kg/m² (PESO NORMAL)\nPeso Registrado: 70.0 kg\nProgreso: -2.0 kg acumulados desde el inicio.\nMeta: MANTENER_PESO\nObservaciones: El usuario mantiene una trayectoria estable dentro del rango saludable con variaciones controladas.`,
          fecha: new Date().toISOString(),
        };
        this.reportes.unshift(nuevoMock);
        this.mensajeExito = '¡Reporte generado satisfactoriamente!';
        setTimeout(() => this.mensajeExito = '', 4000);
      }
    });
  }

  formatFecha(fechaIso: string): string {
    if (!fechaIso) return 'Reciente';
    const date = new Date(fechaIso);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getMockReportes(): ReporteResponse[] {
    return [
      {
        id: 'rep-01',
        tipo: 'PROGRESO_GENERAL',
        contenido: `=== RESUMEN NUTRICIONAL ===\nPeso Actual: 70.0 kg | Estatura: 177 cm\nIMC: 22.3 kg/m² (Rango Normal según OMS)\nVariación últimos 30 días: -2.0 kg\nMeta declarada: Mantenimiento de masa muscular y hábitos saludables.\nDiagnóstico: Parámetros antropométricos estables y favorables.`,
        fecha: new Date().toISOString(),
      }
    ];
  }
}

