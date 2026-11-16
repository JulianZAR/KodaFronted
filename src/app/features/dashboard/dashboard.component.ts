import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { Observable, of, switchMap, tap } from 'rxjs';
import { ImcService, ImcResponse, infoImc } from '../../core/services/imc.service';
import { ProgresoService, ProgresoResponse } from '../../core/services/progreso.service';
import { UsuarioService, PerfilResponse } from '../../core/services/usuario.service';
import { esEstado, mensajeDeError } from '../../core/http/mensaje-error';

interface HistorialItem {
  id: string;
  fecha: string;
  pesoKg: number;
  imc: number;
  estado: string;
  badgeClass: string;
  dotColor: string;
  cambioKg: number | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <!-- Reusable Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Main Layout -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Reusable Header -->
        <app-header title="Salud corporal"></app-header>

        <!-- Main Page Content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          <!-- Top Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Calculadora de IMC
              </h1>
              <p class="text-sm text-slate-500 mt-1">
                Conoce tu índice de masa corporal y revisa tu evolución.
              </p>
            </div>
            <div>
              <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-xs">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Datos privados y seguros</span>
              </span>
            </div>
          </div>

          <div *ngIf="errorCarga" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {{ errorCarga }}
          </div>

          <!-- 2 Cards Grid: Data Input + Result -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            <!-- Left Card: Ingresa tus datos -->
            <div class="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <h2 class="text-lg font-bold text-slate-900 mb-1">
                  Ingresa tus datos
                </h2>
                <p class="text-xs text-slate-500 mb-6">
                  Usaremos estos valores para calcular tu resultado.
                </p>

                <!-- Feedback Banner -->
                <div *ngIf="submitSuccess" class="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>¡Pesaje e IMC registrados exitosamente!</span>
                </div>
                <div *ngIf="submitError" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {{ submitError }}
                </div>

                <!-- Form Inputs -->
                <form (ngSubmit)="registrarPesaje()" class="space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Estatura -->
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                        Estatura
                      </label>
                      <div class="relative">
                        <input
                          type="number"
                          [(ngModel)]="estaturaCm"
                          name="estaturaCm"
                          required
                          min="30"
                          max="250"
                          step="1"
                          placeholder="170"
                          class="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold text-base outline-none transition"
                        />
                        <span class="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                          cm
                        </span>
                      </div>
                    </div>

                    <!-- Peso actual -->
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                        Peso actual
                      </label>
                      <div class="relative">
                        <input
                          type="number"
                          [(ngModel)]="pesoKg"
                          name="pesoKg"
                          required
                          min="1"
                          max="500"
                          step="0.1"
                          placeholder="70"
                          class="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold text-base outline-none transition"
                        />
                        <span class="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                          kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Submit button -->
                  <div class="pt-2">
                    <button
                      type="submit"
                      [disabled]="saving"
                      class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
                    >
                      <span *ngIf="!saving">Calcular y Registrar</span>
                      <span *ngIf="saving" class="flex items-center gap-2">
                        <svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Guardando...</span>
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              <!-- Recommendation Hint Box -->
              <div class="mt-6 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p class="text-xs text-emerald-900 leading-relaxed font-medium">
                  <span class="font-bold">Consejo:</span> mídete sin calzado y registra tu peso a la misma hora para obtener resultados consistentes.
                </p>
              </div>
            </div>

            <!-- Right Card: TU RESULTADO (Dark Navy Card) -->
            <div class="lg:col-span-6 bg-[#0e172e] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between text-white relative overflow-hidden">
              <!-- Top Row -->
              <div>
                <div class="flex items-center justify-between mb-4">
                  <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Tu Resultado
                  </p>
                  <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="4" y="2" width="16" height="20" rx="2" stroke-width="2"/>
                      <line x1="8" y1="6" x2="16" y2="6" stroke-width="2"/>
                      <circle cx="8" cy="11" r="1" fill="currentColor"/>
                      <circle cx="12" cy="11" r="1" fill="currentColor"/>
                      <circle cx="16" cy="11" r="1" fill="currentColor"/>
                      <circle cx="8" cy="15" r="1" fill="currentColor"/>
                      <circle cx="12" cy="15" r="1" fill="currentColor"/>
                      <circle cx="16" cy="15" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                </div>

                <!-- Big Numeric Value & Category -->
                <div class="flex items-baseline gap-3 mb-2">
                  <span class="text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
                    {{ imc ? (imc.valor | number:'1.1-1') : '—' }}
                  </span>
                  <span class="text-slate-400 text-sm font-medium">kg/m²</span>
                </div>

                <!-- Status Badge -->
                <div class="mb-3" *ngIf="imcInfo">
                  <span
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                    [ngClass]="imcInfo.badgeClass"
                  >
                    <span class="w-2 h-2 rounded-full" [style.backgroundColor]="imcInfo.colorHex"></span>
                    {{ imcInfo.label }}
                  </span>
                </div>

                <!-- Descriptive text -->
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md">
                  {{ imcInfo ? imcInfo.description : 'Ingresa tu estatura y tu peso y presiona «Calcular y Registrar» para conocer tu IMC.' }}
                </p>
              </div>

              <!-- Horizontal Rainbow Range Bar with Pin Marker -->
              <div class="mt-8 pt-4">
                <!-- Pin marker positioned at percentage -->
                <div class="relative h-6 mb-1">
                  <div
                    *ngIf="imc"
                    class="absolute -translate-x-1/2 flex flex-col items-center transition-all duration-500 ease-out"
                    [style.left]="imcBarPercent + '%'"
                  >
                    <div class="bg-white text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-md border border-slate-200">
                      {{ imc.valor | number:'1.1-1' }}
                    </div>
                    <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white"></div>
                  </div>
                </div>

                <!-- Segmented Color Track -->
                <div class="w-full h-2.5 rounded-full overflow-hidden flex">
                  <div class="w-[20%] bg-blue-500" title="Bajo peso (<18.5)"></div>
                  <div class="w-[35%] bg-emerald-500" title="Normal (18.5 - 24.9)"></div>
                  <div class="w-[25%] bg-amber-500" title="Sobrepeso (25 - 29.9)"></div>
                  <div class="w-[20%] bg-rose-500" title="Obesidad (>=30)"></div>
                </div>

                <!-- Range Labels -->
                <div class="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-medium">
                  <span>Bajo peso<br><span class="text-[9px] text-slate-500">&lt; 18.5</span></span>
                  <span class="text-center">Normal<br><span class="text-[9px] text-slate-500">18.5 - 24.9</span></span>
                  <span class="text-center">Sobrepeso<br><span class="text-[9px] text-slate-500">25.0 - 29.9</span></span>
                  <span class="text-right">Obesidad<br><span class="text-[9px] text-slate-500">&ge; 30.0</span></span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Card: Historial de registros -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 class="text-lg font-bold text-slate-900">
                  Historial de registros
                </h2>
                <p class="text-xs text-slate-500 mt-0.5">
                  Tu evolución, registro a registro
                </p>
              </div>

              <!-- Static UI Button according to prompt guidelines -->
              <div>
                <button
                  type="button"
                  (click)="exportarCsvEstatico()"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                  title="Descargar historial"
                >
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            <!-- Table of Records -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th class="py-3 px-4">Fecha</th>
                    <th class="py-3 px-4">Peso (kg)</th>
                    <th class="py-3 px-4">IMC Calculado</th>
                    <th class="py-3 px-4">Estado</th>
                    <th class="py-3 px-4 text-right">Cambio</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                  <tr *ngFor="let item of historial" class="hover:bg-slate-50/80 transition">
                    <!-- Fecha -->
                    <td class="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-2.5">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ item.fecha }}</span>
                    </td>

                    <!-- Peso -->
                    <td class="py-3.5 px-4 font-semibold text-slate-900">
                      {{ item.pesoKg | number:'1.1-1' }}
                    </td>

                    <!-- IMC -->
                    <td class="py-3.5 px-4 text-slate-600 font-medium">
                      {{ item.imc | number:'1.1-1' }}
                    </td>

                    <!-- Estado Pill -->
                    <td class="py-3.5 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold" [ngClass]="item.badgeClass">
                        <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="item.dotColor"></span>
                        {{ item.estado }}
                      </span>
                    </td>

                    <!-- Cambio Neto -->
                    <td class="py-3.5 px-4 text-right font-semibold" [ngClass]="{
                      'text-emerald-600': item.cambioKg !== null && item.cambioKg < 0,
                      'text-rose-600': item.cambioKg !== null && item.cambioKg > 0,
                      'text-slate-400': item.cambioKg === 0 || item.cambioKg === null
                    }">
                      <span *ngIf="item.cambioKg !== null">
                        {{ item.cambioKg > 0 ? '+' : '' }}{{ item.cambioKg | number:'1.1-1' }} kg
                      </span>
                      <span *ngIf="item.cambioKg === null" class="text-slate-300 font-normal">—</span>
                    </td>
                  </tr>

                  <tr *ngIf="historial.length === 0 && !cargandoHistorial">
                    <td colspan="5" class="py-8 text-center text-slate-400 text-xs">
                      No hay registros de progreso aún. Ingresa tu peso actual arriba para comenzar.
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
export class DashboardComponent implements OnInit {
  private readonly imcService = inject(ImcService);
  private readonly progresoService = inject(ProgresoService);
  private readonly usuarioService = inject(UsuarioService);

  perfil: PerfilResponse | null = null;
  estaturaCm: number | null = null;
  pesoKg: number | null = null;
  saving = false;
  submitSuccess = false;
  submitError = '';
  errorCarga = '';

  /** IMC calculado por el backend; null mientras el perfil esté incompleto. */
  imc: ImcResponse | null = null;
  historial: HistorialItem[] = [];
  cargandoHistorial = true;

  get imcInfo() {
    return infoImc(this.imc?.categoria);
  }

  get imcBarPercent(): number {
    // Normaliza el IMC entre 14 y 38 para posicionar el marcador en la barra
    const min = 14;
    const max = 38;
    const clamped = Math.min(Math.max(this.imc?.valor ?? min, min), max);
    return Math.round(((clamped - min) / (max - min)) * 100);
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarImc();
    this.cargarHistorial();
  }

  cargarDatosUsuario(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (perfil) => {
        this.perfil = perfil;
        this.estaturaCm = perfil.estaturaCm;
        this.pesoKg = perfil.pesoKg;
      },
      error: (err) => this.errorCarga = mensajeDeError(err, 'No se pudo cargar tu perfil.'),
    });
  }

  cargarImc(): void {
    this.imcService.miImcActual().subscribe({
      next: (res) => this.imc = res,
      error: (err) => {
        // 409 = perfil sin peso o estatura todavía: no es un error, solo no hay IMC
        this.imc = null;
        if (!esEstado(err, 409)) {
          this.errorCarga = mensajeDeError(err, 'No se pudo consultar tu IMC.');
        }
      },
    });
  }

  cargarHistorial(): void {
    this.cargandoHistorial = true;
    this.progresoService.consultarHistorial().subscribe({
      next: (data) => {
        this.historial = this.mapearHistorial(data ?? []);
        this.cargandoHistorial = false;
      },
      error: (err) => {
        this.historial = [];
        this.cargandoHistorial = false;
        this.errorCarga = mensajeDeError(err, 'No se pudo cargar tu historial.');
      },
    });
  }

  registrarPesaje(): void {
    const estatura = Number(this.estaturaCm);
    const peso = Number(this.pesoKg);
    if (!estatura || estatura < 30 || estatura > 250) {
      this.submitError = 'La estatura debe estar entre 30 y 250 cm.';
      return;
    }
    if (!peso || peso < 1 || peso > 500) {
      this.submitError = 'El peso debe estar entre 1 y 500 kg.';
      return;
    }

    this.saving = true;
    this.submitSuccess = false;
    this.submitError = '';

    // El IMC se calcula con la estatura del perfil: si cambió, se guarda primero.
    const guardarEstatura$: Observable<unknown> = this.perfil?.estaturaCm === estatura
      ? of(null)
      : this.usuarioService.actualizarPerfil({ estaturaCm: estatura, meta: this.perfil?.meta ?? null })
          .pipe(tap(perfil => this.perfil = perfil));

    guardarEstatura$.pipe(
      switchMap(() => this.progresoService.registrar({ pesoKg: peso })),
    ).subscribe({
      next: (progreso) => {
        this.saving = false;
        this.submitSuccess = true;
        this.imc = { valor: progreso.imc, categoria: progreso.categoria };
        if (this.perfil) this.perfil = { ...this.perfil, pesoKg: progreso.pesoKg };
        this.cargarHistorial();
        setTimeout(() => this.submitSuccess = false, 3500);
      },
      error: (err) => {
        this.saving = false;
        this.submitError = mensajeDeError(err, 'No se pudo registrar el pesaje. Intenta de nuevo.');
      },
    });
  }

  private mapearHistorial(data: ProgresoResponse[]): HistorialItem[] {
    return data.map((item, index) => {
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
        pesoKg: item.pesoKg,
        imc: item.imc,
        estado: info?.label ?? item.categoria,
        badgeClass: info?.badgeClass ?? 'bg-slate-100 text-slate-600 border-slate-200',
        dotColor: info?.colorHex ?? '#94a3b8',
        cambioKg: cambio,
      };
    });
  }

  exportarCsvEstatico(): void {
    // Generate clean CSV in memory and download without network call
    let csv = 'Fecha,Peso_Kg,IMC,Estado\n';
    this.historial.forEach(h => {
      csv += `"${h.fecha}",${h.pesoKg},${h.imc},"${h.estado}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrigo-progreso-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
