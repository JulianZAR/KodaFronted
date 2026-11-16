import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { AdminService, CuentaResponse, RolAsignable } from '../../core/services/admin.service';
import { AuthService } from '../../core/auth/auth.service';
import { mensajeDeError } from '../../core/http/mensaje-error';

/** Administración de roles (solo ADMIN): nombrar o retirar nutricionistas y administradores. */
@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <app-header title="Administración"></app-header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Usuarios y roles</h1>
              <p class="text-sm text-slate-500 mt-1">
                Todas las cuentas tienen el rol Usuario. Aquí puedes nombrar nutricionistas y administradores.
              </p>
            </div>
            <input
              type="search"
              [(ngModel)]="filtro"
              placeholder="Buscar por nombre o correo"
              class="w-full sm:w-72 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-sm outline-none transition bg-white"
            />
          </div>

          <div class="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-2">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Los cambios de rol se aplican cuando la persona vuelve a iniciar sesión (o en unos minutos, al renovarse su sesión).</span>
          </div>

          <div *ngIf="mensaje" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">{{ mensaje }}</div>
          <div *ngIf="error" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">{{ error }}</div>

          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div *ngIf="cargando" class="py-12 text-center text-xs text-slate-400">Cargando cuentas...</div>

            <div *ngIf="!cargando" class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th class="py-3 px-4">Cuenta</th>
                    <th class="py-3 px-4">Roles</th>
                    <th class="py-3 px-4 text-center">Nutricionista</th>
                    <th class="py-3 px-4 text-center">Administrador</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                  <tr *ngFor="let c of filtradas" class="hover:bg-slate-50/80 transition">
                    <td class="py-3.5 px-4">
                      <p class="font-semibold text-slate-900">
                        {{ c.nombre }}
                        <span *ngIf="esYo(c)" class="ml-1 text-[10px] font-bold uppercase text-emerald-600">(tú)</span>
                        <span *ngIf="!c.habilitado" class="ml-1 text-[10px] font-bold uppercase text-slate-400">deshabilitada</span>
                      </p>
                      <p class="text-xs text-slate-500">{{ c.email || c.username }}</p>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex flex-wrap gap-1.5">
                        <span *ngFor="let r of c.roles" class="px-2.5 py-0.5 rounded-full text-xs font-semibold border" [ngClass]="claseRol(r)">
                          {{ etiquetaRol(r) }}
                        </span>
                      </div>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <button type="button" role="switch" [attr.aria-checked]="tiene(c, 'NUTRITIONIST')"
                        [attr.aria-label]="'Nutricionista: ' + c.nombre"
                        (click)="alternar(c, 'NUTRITIONIST')" [disabled]="ocupado === c.keycloakUserId"
                        class="relative inline-flex h-6 w-11 rounded-full transition disabled:opacity-50"
                        [ngClass]="tiene(c, 'NUTRITIONIST') ? 'bg-emerald-500' : 'bg-slate-200'">
                        <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                          [ngClass]="tiene(c, 'NUTRITIONIST') ? 'left-[22px]' : 'left-0.5'"></span>
                      </button>
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <button type="button" role="switch" [attr.aria-checked]="tiene(c, 'ADMIN')"
                        [attr.aria-label]="'Administrador: ' + c.nombre"
                        [title]="esYo(c) ? 'No puedes quitarte tu propio rol de administrador' : ''"
                        (click)="alternar(c, 'ADMIN')" [disabled]="ocupado === c.keycloakUserId || (esYo(c) && tiene(c, 'ADMIN'))"
                        class="relative inline-flex h-6 w-11 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                        [ngClass]="tiene(c, 'ADMIN') ? 'bg-indigo-500' : 'bg-slate-200'">
                        <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
                          [ngClass]="tiene(c, 'ADMIN') ? 'left-[22px]' : 'left-0.5'"></span>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="filtradas.length === 0">
                    <td colspan="4" class="py-8 text-center text-slate-400 text-xs">No hay cuentas que coincidan.</td>
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
export class AdminUsuariosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly auth = inject(AuthService);

  cuentas: CuentaResponse[] = [];
  filtro = '';
  cargando = true;
  ocupado: string | null = null;
  mensaje = '';
  error = '';

  get filtradas(): CuentaResponse[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.cuentas;
    return this.cuentas.filter(c =>
      c.nombre.toLowerCase().includes(f) || c.email.toLowerCase().includes(f) || c.username.toLowerCase().includes(f));
  }

  ngOnInit(): void {
    this.adminService.listarCuentas().subscribe({
      next: (cuentas) => {
        this.cuentas = [...cuentas].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.error = mensajeDeError(err, 'No se pudieron cargar las cuentas.');
      },
    });
  }

  tiene(c: CuentaResponse, rol: string): boolean {
    return c.roles.includes(rol);
  }

  esYo(c: CuentaResponse): boolean {
    return c.keycloakUserId === this.auth.keycloakUserId;
  }

  alternar(c: CuentaResponse, rol: RolAsignable): void {
    const quitar = this.tiene(c, rol);
    this.ocupado = c.keycloakUserId;
    this.mensaje = '';
    this.error = '';

    const peticion = quitar ? this.adminService.quitarRol(c.keycloakUserId, rol) : this.adminService.asignarRol(c.keycloakUserId, rol);
    peticion.subscribe({
      next: () => {
        this.ocupado = null;
        c.roles = quitar ? c.roles.filter(r => r !== rol) : [...c.roles, rol].sort();
        this.mensaje = `${c.nombre} ${quitar ? 'ya no es' : 'ahora es'} ${this.etiquetaRol(rol).toLowerCase()}.`;
      },
      error: (err) => {
        this.ocupado = null;
        this.error = mensajeDeError(err, 'No se pudo cambiar el rol.');
      },
    });
  }

  etiquetaRol(rol: string): string {
    return rol === 'ADMIN' ? 'Administrador' : rol === 'NUTRITIONIST' ? 'Nutricionista' : 'Usuario';
  }

  claseRol(rol: string): string {
    if (rol === 'ADMIN') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (rol === 'NUTRITIONIST') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}
