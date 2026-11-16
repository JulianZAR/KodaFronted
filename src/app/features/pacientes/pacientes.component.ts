import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { PacientesService, PacienteResponse } from '../../core/services/pacientes.service';
import { infoImc } from '../../core/services/imc.service';
import { etiquetaMeta } from '../../core/services/usuario.service';
import { mensajeDeError } from '../../core/http/mensaje-error';

/** Lista de pacientes para NUTRITIONIST y ADMIN. */
@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, RouterLink, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <app-header title="Gestión de pacientes"></app-header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Pacientes</h1>
              <p class="text-sm text-slate-500 mt-1">
                Revisa el estado de cada paciente y asígnale o actualiza su plan nutricional.
              </p>
            </div>
            <div class="relative w-full sm:w-72">
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="search"
                [(ngModel)]="filtro"
                placeholder="Buscar por nombre o correo"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm outline-none transition bg-white"
              />
            </div>
          </div>

          <!-- Resumen -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pacientes</p>
              <p class="text-2xl sm:text-3xl font-extrabold text-slate-900">{{ pacientes.length }}</p>
            </div>
            <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sin plan asignado</p>
              <p class="text-2xl sm:text-3xl font-extrabold text-amber-600">{{ sinPlan }}</p>
            </div>
            <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Perfil incompleto</p>
              <p class="text-2xl sm:text-3xl font-extrabold text-slate-900">{{ sinDatos }}</p>
            </div>
            <div class="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">IMC fuera de rango</p>
              <p class="text-2xl sm:text-3xl font-extrabold text-rose-600">{{ fueraDeRango }}</p>
            </div>
          </div>

          <div *ngIf="error" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">{{ error }}</div>

          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div *ngIf="cargando" class="py-12 text-center text-xs text-slate-400">Cargando pacientes...</div>

            <div *ngIf="!cargando" class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th class="py-3 px-4">Paciente</th>
                    <th class="py-3 px-4">IMC</th>
                    <th class="py-3 px-4">Meta</th>
                    <th class="py-3 px-4">Plan vigente</th>
                    <th class="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                  <tr *ngFor="let p of filtrados" class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {{ iniciales(p.nombre) }}
                        </div>
                        <div class="min-w-0">
                          <p class="font-semibold text-slate-900 truncate">{{ p.nombre }}</p>
                          <p class="text-xs text-slate-500 truncate">{{ p.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <ng-container *ngIf="p.imc !== null; else sinImc">
                        <span class="font-semibold text-slate-800 mr-2">{{ p.imc | number:'1.1-1' }}</span>
                        <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border" [ngClass]="info(p.categoriaImc)?.badgeClass">
                          {{ info(p.categoriaImc)?.label }}
                        </span>
                      </ng-container>
                      <ng-template #sinImc><span class="text-xs text-slate-400">Perfil incompleto</span></ng-template>
                    </td>
                    <td class="py-3.5 px-4 text-slate-600">{{ p.meta ? meta(p.meta) : '—' }}</td>
                    <td class="py-3.5 px-4">
                      <span *ngIf="p.plan" class="text-slate-800 font-medium">{{ p.plan.nombre }}</span>
                      <span *ngIf="!p.plan" class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Sin plan</span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <a [routerLink]="['/pacientes', p.id]" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition">
                        Ver ficha
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                      </a>
                    </td>
                  </tr>
                  <tr *ngIf="filtrados.length === 0">
                    <td colspan="5" class="py-8 text-center text-slate-400 text-xs">
                      {{ pacientes.length === 0 ? 'Aún no hay pacientes registrados.' : 'Ningún paciente coincide con la búsqueda.' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class PacientesComponent implements OnInit {
  private readonly pacientesService = inject(PacientesService);

  pacientes: PacienteResponse[] = [];
  filtro = '';
  cargando = true;
  error = '';

  get filtrados(): PacienteResponse[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.pacientes;
    return this.pacientes.filter(p => p.nombre.toLowerCase().includes(f) || p.email.toLowerCase().includes(f));
  }

  get sinPlan(): number {
    return this.pacientes.filter(p => !p.plan).length;
  }

  get sinDatos(): number {
    return this.pacientes.filter(p => p.imc === null).length;
  }

  get fueraDeRango(): number {
    return this.pacientes.filter(p => p.categoriaImc && p.categoriaImc !== 'NORMAL').length;
  }

  ngOnInit(): void {
    this.pacientesService.listar().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeDeError(err, 'No se pudo cargar la lista de pacientes.');
      },
    });
  }

  info(categoria: string | null) {
    return infoImc(categoria);
  }

  meta(meta: string): string {
    return etiquetaMeta(meta);
  }

  iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/);
    return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?';
  }
}
