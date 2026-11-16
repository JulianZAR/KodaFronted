import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { ProgresoService, ProgresoResponse } from '../../core/services/progreso.service';
import { infoImc } from '../../core/services/imc.service';
import { mensajeDeError } from '../../core/http/mensaje-error';

interface ProgresoFila {
  id: string;
  fecha: string;
  pesoAnterior: number | null;
  pesoActual: number;
  cambioNeto: number | null;
  imc: number;
  categoria: string;
  badgeClass: string;
}

@Component({
  selector: 'app-progreso',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <app-header title="Evolución y Progreso"></app-header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          <!-- Page Title & Actions -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Mi Progreso
              </h1>
              <p class="text-sm text-slate-500 mt-1">
                Monitorea cada cambio de peso y tu avance hacia tus objetivos nutricionales.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="mostrarFormulario = !mostrarFormulario"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Registrar Pesaje</span>
              </button>
            </div>
          </div>

          <!-- Quick Weight Log Drawer/Form -->
          <div *ngIf="mostrarFormulario" class="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm animate-fade-in">
            <h2 class="text-base font-bold text-slate-900 mb-1">Registrar nuevo pesaje</h2>
            <p class="text-xs text-slate-500 mb-4">Ingresa tu peso en kilogramos medido hoy.</p>
            <div *ngIf="errorGuardar" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs max-w-md">
              {{ errorGuardar }}
            </div>
            
            <form (ngSubmit)="guardarPesaje()" class="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 max-w-md">
              <div class="flex-1">
                <label class="block text-xs font-semibold text-slate-700 mb-1">Peso actual (kg)</label>
                <input
                  type="number"
                  [(ngModel)]="nuevoPeso"
                  name="nuevoPeso"
                  required
                  step="0.1"
                  min="1"
                  max="500"
                  placeholder="Ej. 69.5"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm font-semibold outline-none transition"
                />
              </div>
              <button
                type="submit"
                [disabled]="guardando"
                class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition disabled:opacity-60"
              >
                {{ guardando ? 'Guardando...' : 'Guardar Pesaje' }}
              </button>
              <button
                type="button"
                (click)="mostrarFormulario = false; errorGuardar = ''"
                class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
              >
                Cancelar
              </button>
            </form>
          </div>

          <div *ngIf="errorCarga" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {{ errorCarga }}
          </div>

          <!-- Summary Metric Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Card 1: Peso Actual -->
            <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Peso Actual</p>
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {{ pesoActual !== null ? (pesoActual | number:'1.1-1') : '—' }}
                </span>
                <span class="text-xs text-slate-500 font-semibold">kg</span>
              </div>
            </div>

            <!-- Card 2: Peso Inicial -->
            <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Peso Inicial</p>
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {{ pesoInicial !== null ? (pesoInicial | number:'1.1-1') : '—' }}
                </span>
                <span class="text-xs text-slate-500 font-semibold">kg</span>
              </div>
            </div>

            <!-- Card 3: Cambio Total -->
            <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cambio Neto</p>
              <div class="flex items-baseline gap-1.5">
                <span
                  class="text-2xl sm:text-3xl font-extrabold"
                  [ngClass]="cambioTotal === null ? 'text-slate-800' : (cambioTotal < 0 ? 'text-emerald-600' : (cambioTotal > 0 ? 'text-rose-600' : 'text-slate-800'))"
                >
                  <ng-container *ngIf="cambioTotal !== null; else sinCambio">{{ cambioTotal > 0 ? '+' : '' }}{{ cambioTotal | number:'1.1-1' }}</ng-container>
                  <ng-template #sinCambio>—</ng-template>
                </span>
                <span class="text-xs text-slate-500 font-semibold">kg</span>
              </div>
            </div>

            <!-- Card 4: Total Registros -->
            <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Registros</p>
              <div class="flex items-baseline gap-1.5">
                <span class="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {{ filas.length }}
                </span>
                <span class="text-xs text-slate-500 font-semibold">pesajes</span>
              </div>
            </div>
          </div>

          <!-- Main Table Card -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-bold text-slate-900">Evolución Detallada</h2>
                <p class="text-xs text-slate-500">Historial ordenado cronológicamente</p>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th class="py-3 px-4">Fecha</th>
                    <th class="py-3 px-4">Peso Anterior</th>
                    <th class="py-3 px-4">Peso Actual</th>
                    <th class="py-3 px-4">Cambio Neto</th>
                    <th class="py-3 px-4">IMC</th>
                    <th class="py-3 px-4">Categoría</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                  <tr *ngFor="let fila of filas" class="hover:bg-slate-50/80 transition">
                    <!-- Fecha -->
                    <td class="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-2">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ fila.fecha }}</span>
                    </td>

                    <!-- Peso Anterior -->
                    <td class="py-3.5 px-4 text-slate-500">
                      {{ fila.pesoAnterior ? (fila.pesoAnterior | number:'1.1-1') + ' kg' : '—' }}
                    </td>

                    <!-- Peso Actual -->
                    <td class="py-3.5 px-4 font-bold text-slate-900">
                      {{ fila.pesoActual | number:'1.1-1' }} kg
                    </td>

                    <!-- Cambio Neto -->
                    <td class="py-3.5 px-4 font-semibold">
                      <span
                        *ngIf="fila.cambioNeto !== null"
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        [ngClass]="fila.cambioNeto < 0 ? 'bg-emerald-50 text-emerald-700' : (fila.cambioNeto > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600')"
                      >
                        {{ fila.cambioNeto > 0 ? '+' : '' }}{{ fila.cambioNeto | number:'1.1-1' }} kg
                      </span>
                      <span *ngIf="fila.cambioNeto === null" class="text-slate-300 font-normal">—</span>
                    </td>

                    <!-- IMC -->
                    <td class="py-3.5 px-4 font-medium text-slate-700">
                      {{ fila.imc | number:'1.1-1' }}
                    </td>

                    <!-- Categoría -->
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border" [ngClass]="fila.badgeClass">
                        {{ fila.categoria }}
                      </span>
                    </td>
                  </tr>

                  <tr *ngIf="filas.length === 0 && !cargando">
                    <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
                      Aún no tienes pesajes registrados. Usa «Registrar Pesaje» para empezar.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </main>
      </div>
    </div>
  `
})
export class ProgresoComponent implements OnInit {
  private readonly progresoService = inject(ProgresoService);

  filas: ProgresoFila[] = [];
  pesoActual: number | null = null;
  pesoInicial: number | null = null;
  cambioTotal: number | null = null;
  cargando = true;
  errorCarga = '';

  mostrarFormulario = false;
  nuevoPeso: number | null = null;
  guardando = false;
  errorGuardar = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.errorCarga = '';
    this.progresoService.consultarHistorial().subscribe({
      next: (data) => {
        this.procesarHistorial(data ?? []);
        this.cargando = false;
      },
      error: (err) => {
        this.procesarHistorial([]);
        this.cargando = false;
        this.errorCarga = mensajeDeError(err, 'No se pudo cargar tu historial de progreso.');
      },
    });
  }

  guardarPesaje(): void {
    const peso = Number(this.nuevoPeso);
    if (!peso || peso < 1 || peso > 500) {
      this.errorGuardar = 'El peso debe estar entre 1 y 500 kg.';
      return;
    }

    this.guardando = true;
    this.errorGuardar = '';
    this.progresoService.registrar({ pesoKg: peso }).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarFormulario = false;
        this.nuevoPeso = null;
        this.cargarDatos();
      },
      error: (err) => {
        // p. ej. 409 si el perfil aún no tiene estatura
        this.guardando = false;
        this.errorGuardar = mensajeDeError(err, 'No se pudo guardar el pesaje. Intenta de nuevo.');
      },
    });
  }

  private procesarHistorial(data: ProgresoResponse[]): void {
    this.filas = data.map((item, index) => {
      const prev = data[index + 1];
      const cambio = prev ? parseFloat((item.pesoKg - prev.pesoKg).toFixed(1)) : null;
      const info = infoImc(item.categoria);

      const dateObj = new Date(item.fecha);
      const isToday = new Date().toDateString() === dateObj.toDateString();
      const fechaStr = isToday
        ? 'Hoy, ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

      return {
        id: item.id,
        fecha: fechaStr,
        pesoAnterior: prev ? prev.pesoKg : null,
        pesoActual: item.pesoKg,
        cambioNeto: cambio,
        imc: item.imc,
        categoria: info?.label ?? item.categoria,
        badgeClass: info?.badgeClass ?? 'bg-slate-100 text-slate-600 border-slate-200',
      };
    });

    this.recalcularTotales();
  }

  private recalcularTotales(): void {
    if (this.filas.length === 0) {
      this.pesoActual = this.pesoInicial = this.cambioTotal = null;
      return;
    }
    this.pesoActual = this.filas[0].pesoActual;
    this.pesoInicial = this.filas[this.filas.length - 1].pesoActual;
    this.cambioTotal = parseFloat((this.pesoActual - this.pesoInicial).toFixed(1));
  }
}
