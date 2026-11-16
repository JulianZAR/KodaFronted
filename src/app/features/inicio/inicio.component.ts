import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { AuthService } from '../../core/auth/auth.service';
import { ImcService, ImcResponse, infoImc } from '../../core/services/imc.service';
import { ProgresoService, ProgresoResponse } from '../../core/services/progreso.service';
import { PlanService, PlanResponse } from '../../core/services/plan.service';
import { PacientesService } from '../../core/services/pacientes.service';
import { NotificacionesService, NotificacionResponse } from '../../core/services/notificaciones.service';
import { etiquetaMeta } from '../../core/services/usuario.service';
import { esEstado, mensajeDeError } from '../../core/http/mensaje-error';
import { diasDesde, haceCuanto, textoDias } from '../../core/util/tiempo';

/** Días sin pesarse a partir de los cuales se recuerda registrar el peso. */
const DIAS_RECORDATORIO = 7;

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <app-header title="Inicio"></app-header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Hola, {{ nombre }}</h1>
            <p class="text-sm text-slate-500 mt-1">Este es el resumen de tu seguimiento nutricional.</p>
          </div>

          <div *ngIf="error" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">{{ error }}</div>

          <!-- Recordatorio de pesaje -->
          <div *ngIf="!cargando && necesitaPesaje"
               class="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p class="text-sm font-bold text-amber-900">
                  {{ ultimo ? 'Hace ' + diasUltimo + ' días que no registras tu peso' : 'Aún no has registrado tu peso' }}
                </p>
                <p class="text-xs text-amber-800">Registrarlo cada semana ayuda a tu nutricionista a ajustar tu plan.</p>
              </div>
            </div>
            <a routerLink="/calculadora" class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold text-center transition">
              Registrar pesaje
            </a>
          </div>

          <!-- Tarjetas de resumen -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- IMC -->
            <a routerLink="/calculadora" class="group bg-[#0e172e] rounded-3xl p-6 border border-slate-800 shadow-xl text-white hover:-translate-y-0.5 transition">
              <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tu IMC</p>
              <ng-container *ngIf="imc; else sinImc">
                <p class="mt-3 text-5xl font-extrabold tracking-tight">{{ imc.valor | number:'1.1-1' }}</p>
                <span class="inline-flex mt-3 px-3 py-1 rounded-full text-xs font-bold border" [ngClass]="infoImc?.badgeClass">{{ infoImc?.label }}</span>
              </ng-container>
              <ng-template #sinImc>
                <p class="mt-3 text-5xl font-extrabold tracking-tight text-slate-600">—</p>
                <p class="mt-3 text-xs text-slate-400">Ingresa tu estatura y peso para calcularlo.</p>
              </ng-template>
              <p class="mt-5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">Ir a la calculadora →</p>
            </a>

            <!-- Último pesaje -->
            <a routerLink="/progreso" class="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition">
              <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Último pesaje</p>
              <ng-container *ngIf="ultimo; else sinPesajes">
                <p class="mt-3 text-4xl font-extrabold text-slate-900">{{ ultimo.pesoKg | number:'1.1-1' }} <span class="text-base font-semibold text-slate-400">kg</span></p>
                <p class="mt-2 text-xs text-slate-500">Registrado {{ textoDias(diasUltimo) }} · {{ registros }} {{ registros === 1 ? 'pesaje' : 'pesajes' }} en total</p>
                <p *ngIf="cambioTotal !== null" class="mt-1 text-xs font-semibold"
                   [ngClass]="cambioTotal < 0 ? 'text-emerald-600' : cambioTotal > 0 ? 'text-rose-600' : 'text-slate-500'">
                  {{ cambioTotal > 0 ? '+' : '' }}{{ cambioTotal | number:'1.1-1' }} kg desde tu primer registro
                </p>
              </ng-container>
              <ng-template #sinPesajes>
                <p class="mt-3 text-4xl font-extrabold text-slate-300">—</p>
                <p class="mt-2 text-xs text-slate-500">Aún no hay registros.</p>
              </ng-template>
              <p class="mt-5 text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">Ver mi progreso →</p>
            </a>

            <!-- Plan -->
            <a routerLink="/plan" class="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition">
              <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">Plan nutricional</p>
              <ng-container *ngIf="plan; else sinPlan">
                <p class="mt-3 text-lg font-bold text-slate-900 leading-snug">{{ plan.nombre }}</p>
                <span class="inline-flex mt-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {{ objetivo(plan.objetivo) }}
                </span>
              </ng-container>
              <ng-template #sinPlan>
                <p class="mt-3 text-lg font-bold text-slate-400">Sin plan asignado</p>
                <p class="mt-2 text-xs text-slate-500">Tu nutricionista te asignará uno pronto.</p>
              </ng-template>
              <p class="mt-5 text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">Ver mi plan →</p>
            </a>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Avisos recientes -->
            <div class="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h2 class="text-base font-bold text-slate-900">Avisos recientes</h2>
              <p class="text-xs text-slate-500 mt-0.5 mb-4">Lo último que tu nutricionista o el administrador hicieron en tu cuenta.</p>
              <div class="divide-y divide-slate-100">
                <div *ngFor="let n of avisos" class="py-3 flex items-start gap-3">
                  <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" [ngClass]="n.leida ? 'bg-slate-200' : 'bg-emerald-500'"></span>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-800">{{ n.titulo }}</p>
                    <p class="text-xs text-slate-500">{{ n.mensaje }}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">{{ hace(n.fecha) }}</p>
                  </div>
                </div>
                <p *ngIf="avisos.length === 0" class="py-6 text-center text-xs text-slate-400">No tienes avisos todavía.</p>
              </div>
            </div>

            <!-- Accesos rápidos -->
            <div class="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h2 class="text-base font-bold text-slate-900 mb-4">Accesos rápidos</h2>
              <div class="grid grid-cols-1 gap-3">
                <a routerLink="/calculadora" class="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold text-slate-700">
                  Registrar pesaje <span class="text-emerald-600">→</span>
                </a>
                <a routerLink="/reportes" class="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold text-slate-700">
                  Generar un reporte <span class="text-emerald-600">→</span>
                </a>
                <a routerLink="/perfil" class="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold text-slate-700">
                  Actualizar mi perfil y meta <span class="text-emerald-600">→</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Gestión: solo NUTRITIONIST y ADMIN -->
          <div *ngIf="auth.esPersonalClinico" class="bg-gradient-to-br from-[#0e172e] to-[#0b132b] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl text-white">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Gestión · {{ auth.rolPrincipal }}</p>
                <h2 class="text-xl font-bold mt-1">Tus pacientes</h2>
                <p class="text-sm text-slate-400 mt-1">
                  {{ totalPacientes }} pacientes · <span class="text-amber-400 font-semibold">{{ pacientesSinPlan }} sin plan asignado</span>
                </p>
              </div>
              <div class="flex flex-col sm:flex-row gap-3">
                <a routerLink="/pacientes" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold text-center transition">
                  Ver pacientes
                </a>
                <a *ngIf="auth.esAdmin" routerLink="/admin/usuarios" class="px-5 py-2.5 rounded-xl border border-slate-600 hover:bg-slate-800 text-white text-xs font-semibold text-center transition">
                  Usuarios y roles
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class InicioComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly imcService = inject(ImcService);
  private readonly progresoService = inject(ProgresoService);
  private readonly planService = inject(PlanService);
  private readonly pacientesService = inject(PacientesService);
  private readonly notificacionesService = inject(NotificacionesService);

  readonly textoDias = textoDias;

  cargando = true;
  error = '';
  imc: ImcResponse | null = null;
  ultimo: ProgresoResponse | null = null;
  registros = 0;
  cambioTotal: number | null = null;
  plan: PlanResponse | null = null;
  avisos: NotificacionResponse[] = [];
  totalPacientes = 0;
  pacientesSinPlan = 0;

  get nombre(): string {
    return this.auth.userName.split(' ')[0];
  }

  get infoImc() {
    return infoImc(this.imc?.categoria);
  }

  get diasUltimo(): number {
    return this.ultimo ? diasDesde(this.ultimo.fecha) : 0;
  }

  get necesitaPesaje(): boolean {
    return !this.ultimo || this.diasUltimo >= DIAS_RECORDATORIO;
  }

  ngOnInit(): void {
    this.imcService.miImcActual().subscribe({
      next: (r) => this.imc = r,
      error: (err) => { if (!esEstado(err, 409)) this.error = mensajeDeError(err); },
    });
    this.progresoService.consultarHistorial().subscribe({
      next: (h) => {
        this.ultimo = h[0] ?? null;
        this.registros = h.length;
        this.cambioTotal = h.length > 1 ? parseFloat((h[0].pesoKg - h[h.length - 1].pesoKg).toFixed(1)) : null;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeDeError(err, 'No se pudo cargar tu resumen.');
      },
    });
    this.planService.obtenerMiPlan().subscribe({ next: (p) => this.plan = p, error: () => this.plan = null });
    this.notificacionesService.listar().subscribe({ next: (n) => this.avisos = n.slice(0, 4), error: () => this.avisos = [] });

    if (this.auth.esPersonalClinico) {
      this.pacientesService.listar().subscribe({
        next: (p) => {
          this.totalPacientes = p.length;
          this.pacientesSinPlan = p.filter(x => !x.plan).length;
        },
        error: () => { /* la tarjeta de gestión queda en cero */ },
      });
    }
  }

  objetivo(meta: string): string {
    return etiquetaMeta(meta, true);
  }

  hace(iso: string): string {
    return haceCuanto(iso);
  }
}
