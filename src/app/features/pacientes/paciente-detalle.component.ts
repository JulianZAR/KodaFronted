import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { PacientesService, PacienteResponse } from '../../core/services/pacientes.service';
import { ProgresoResponse } from '../../core/services/progreso.service';
import { ReporteResponse, etiquetaTipoReporte } from '../../core/services/reporte.service';
import { infoImc } from '../../core/services/imc.service';
import { METAS, Meta, etiquetaMeta } from '../../core/services/usuario.service';
import { mensajeDeError } from '../../core/http/mensaje-error';

/** Ficha de un paciente para NUTRITIONIST y ADMIN: datos, historial, plan y reportes. */
@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, RouterLink, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <app-header title="Ficha del paciente"></app-header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <a routerLink="/pacientes" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            Volver a pacientes
          </a>

          <div *ngIf="error" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">{{ error }}</div>
          <div *ngIf="cargando" class="py-16 text-center text-xs text-slate-400">Cargando ficha...</div>

          <ng-container *ngIf="paciente as p">
            <!-- Cabecera del paciente -->
            <div class="bg-gradient-to-br from-[#0e172e] to-[#0b132b] rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-lg flex items-center justify-center">
                    {{ iniciales(p.nombre) }}
                  </div>
                  <div>
                    <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">{{ p.nombre }}</h1>
                    <p class="text-sm text-slate-400">{{ p.email }} · Paciente desde {{ fecha(p.fechaRegistro) }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estatura</p>
                    <p class="text-sm font-bold">{{ p.estaturaCm !== null ? (p.estaturaCm | number:'1.0-1') + ' cm' : '—' }}</p>
                  </div>
                  <div class="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Peso</p>
                    <p class="text-sm font-bold">{{ p.pesoKg !== null ? (p.pesoKg | number:'1.1-1') + ' kg' : '—' }}</p>
                  </div>
                  <div class="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">IMC</p>
                    <p class="text-sm font-bold" [style.color]="info(p.categoriaImc)?.colorHex">
                      {{ p.imc !== null ? (p.imc | number:'1.1-1') + ' · ' + info(p.categoriaImc)?.label : '—' }}
                    </p>
                  </div>
                  <div class="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                    <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Meta</p>
                    <p class="text-sm font-bold text-emerald-400">{{ p.meta ? meta(p.meta, true) : 'Sin definir' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <!-- Plan nutricional -->
              <div class="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <h2 class="text-lg font-bold text-slate-900">{{ p.plan ? 'Editar plan nutricional' : 'Asignar plan nutricional' }}</h2>
                <p class="text-xs text-slate-500 mt-0.5 mb-5">
                  {{ p.plan ? 'Plan vigente desde el ' + fecha(p.plan.fechaAsignacion) + '. Al guardar se reemplaza.' : 'Este paciente aún no tiene un plan asignado.' }}
                </p>

                <div *ngIf="planOk" class="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">{{ planOk }}</div>
                <div *ngIf="planError" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">{{ planError }}</div>

                <form (ngSubmit)="guardarPlan()" class="space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Nombre del plan</label>
                    <input type="text" name="nombre" [(ngModel)]="planNombre" maxlength="150" placeholder="Ej. Plan de pérdida de peso - fase 1"
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm outline-none transition" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Objetivo</label>
                    <select name="objetivo" [(ngModel)]="planObjetivo"
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm outline-none transition bg-white">
                      <option [ngValue]="null" disabled>Selecciona un objetivo</option>
                      <option *ngFor="let m of metas" [ngValue]="m.valor">{{ m.label }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1.5">Pautas del plan</label>
                    <textarea name="descripcion" [(ngModel)]="planDescripcion" rows="6" placeholder="Alimentación, porciones, hidratación, actividad física..."
                      class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm outline-none transition resize-y"></textarea>
                  </div>
                  <button type="submit" [disabled]="guardandoPlan"
                    class="w-full px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-60">
                    {{ guardandoPlan ? 'Guardando...' : (p.plan ? 'Actualizar plan' : 'Asignar plan') }}
                  </button>
                </form>
              </div>

              <!-- Historial -->
              <div class="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
                <h2 class="text-lg font-bold text-slate-900">Historial de pesajes</h2>
                <p class="text-xs text-slate-500 mt-0.5 mb-5">Registros del paciente, del más reciente al más antiguo.</p>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th class="py-3 px-3">Fecha</th>
                        <th class="py-3 px-3">Peso</th>
                        <th class="py-3 px-3">IMC</th>
                        <th class="py-3 px-3">Categoría</th>
                        <th class="py-3 px-3 text-right">Cambio</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-sm">
                      <tr *ngFor="let r of historial; let i = index">
                        <td class="py-3 px-3 text-slate-700">{{ fecha(r.fecha) }}</td>
                        <td class="py-3 px-3 font-semibold text-slate-900">{{ r.pesoKg | number:'1.1-1' }} kg</td>
                        <td class="py-3 px-3 text-slate-600">{{ r.imc | number:'1.1-1' }}</td>
                        <td class="py-3 px-3">
                          <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border" [ngClass]="info(r.categoria)?.badgeClass">{{ info(r.categoria)?.label }}</span>
                        </td>
                        <td class="py-3 px-3 text-right font-semibold" [ngClass]="cambioClase(i)">{{ cambio(i) }}</td>
                      </tr>
                      <tr *ngIf="historial.length === 0">
                        <td colspan="5" class="py-8 text-center text-slate-400 text-xs">El paciente aún no ha registrado pesajes.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Reportes -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                  <h2 class="text-lg font-bold text-slate-900">Reportes del paciente</h2>
                  <p class="text-xs text-slate-500 mt-0.5">Resúmenes generados con los datos del momento.</p>
                </div>
                <button type="button" (click)="generarReporte()" [disabled]="generando"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-60">
                  {{ generando ? 'Generando...' : '+ Generar reporte' }}
                </button>
              </div>
              <div *ngIf="reporteError" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">{{ reporteError }}</div>
              <div class="space-y-3">
                <div *ngFor="let r of reportes" class="p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-700">{{ tipo(r.tipo) }}</span>
                    <span class="text-xs text-slate-400">{{ fecha(r.fecha, true) }}</span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-600 font-mono whitespace-pre-wrap">{{ r.contenido }}</p>
                </div>
                <p *ngIf="reportes.length === 0" class="py-6 text-center text-slate-400 text-xs">Este paciente aún no tiene reportes.</p>
              </div>
            </div>
          </ng-container>
        </main>
      </div>
    </div>
  `,
})
export class PacienteDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pacientesService = inject(PacientesService);

  readonly metas = METAS;

  usuarioId = '';
  paciente: PacienteResponse | null = null;
  historial: ProgresoResponse[] = [];
  reportes: ReporteResponse[] = [];
  cargando = true;
  error = '';

  planNombre = '';
  planObjetivo: Meta | null = null;
  planDescripcion = '';
  guardandoPlan = false;
  planOk = '';
  planError = '';

  generando = false;
  reporteError = '';

  ngOnInit(): void {
    this.usuarioId = this.route.snapshot.paramMap.get('id') ?? '';

    this.pacientesService.obtener(this.usuarioId).subscribe({
      next: (p) => {
        this.paciente = p;
        this.cargando = false;
        this.planNombre = p.plan?.nombre ?? '';
        this.planObjetivo = p.plan?.objetivo ?? p.meta ?? null;
        this.planDescripcion = p.plan?.descripcion ?? '';
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeDeError(err, 'No se pudo cargar la ficha del paciente.');
      },
    });
    this.pacientesService.historial(this.usuarioId).subscribe({
      next: (h) => this.historial = h,
      error: () => this.historial = [],
    });
    this.pacientesService.reportes(this.usuarioId).subscribe({
      next: (r) => this.reportes = r,
      error: () => this.reportes = [],
    });
  }

  guardarPlan(): void {
    this.planOk = '';
    this.planError = '';
    if (!this.planNombre.trim()) {
      this.planError = 'El nombre del plan es obligatorio.';
      return;
    }
    if (!this.planObjetivo) {
      this.planError = 'Selecciona el objetivo del plan.';
      return;
    }

    this.guardandoPlan = true;
    const nuevo = !this.paciente?.plan;
    this.pacientesService.asignarPlan(this.usuarioId, {
      nombre: this.planNombre.trim(),
      objetivo: this.planObjetivo,
      descripcion: this.planDescripcion.trim(),
    }).subscribe({
      next: (plan) => {
        this.guardandoPlan = false;
        if (this.paciente) this.paciente = { ...this.paciente, plan };
        this.planOk = nuevo ? 'Plan asignado. El paciente ya puede verlo en su sección "Planes".' : 'Plan actualizado.';
      },
      error: (err) => {
        this.guardandoPlan = false;
        this.planError = mensajeDeError(err, 'No se pudo guardar el plan.');
      },
    });
  }

  generarReporte(): void {
    this.generando = true;
    this.reporteError = '';
    this.pacientesService.generarReporte(this.usuarioId).subscribe({
      next: (r) => {
        this.generando = false;
        this.reportes = [r, ...this.reportes];
      },
      error: (err) => {
        this.generando = false;
        this.reporteError = mensajeDeError(err, 'No se pudo generar el reporte.');
      },
    });
  }

  cambio(i: number): string {
    const prev = this.historial[i + 1];
    if (!prev) return '—';
    const d = parseFloat((this.historial[i].pesoKg - prev.pesoKg).toFixed(1));
    return `${d > 0 ? '+' : ''}${d.toFixed(1)} kg`;
  }

  cambioClase(i: number): string {
    const prev = this.historial[i + 1];
    if (!prev) return 'text-slate-300';
    const d = this.historial[i].pesoKg - prev.pesoKg;
    return d < 0 ? 'text-emerald-600' : d > 0 ? 'text-rose-600' : 'text-slate-400';
  }

  info(categoria: string | null) {
    return infoImc(categoria);
  }

  meta(meta: string, corto = false): string {
    return etiquetaMeta(meta, corto);
  }

  tipo(tipo: string): string {
    return etiquetaTipoReporte(tipo);
  }

  fecha(iso: string, conHora = false): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', conHora
      ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: 'short', year: 'numeric' });
  }

  iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?';
  }
}
