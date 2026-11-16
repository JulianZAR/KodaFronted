import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  NotificacionesService,
  NotificacionResponse,
  RUTA_NOTIFICACION,
  TipoNotificacion,
} from '../../core/services/notificaciones.service';
import { haceCuanto } from '../../core/util/tiempo';

/** Cada cuánto se consultan notificaciones nuevas mientras la página está abierta. */
const INTERVALO_NOTIFICACIONES_MS = 60_000;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="w-full bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm relative z-30">
      <!-- Fecha y sección (deja espacio al botón de menú en móvil) -->
      <div class="pl-12 lg:pl-0">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {{ formattedDate }}
        </p>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">
          {{ title }}
        </h2>
      </div>

      <div class="flex items-center gap-4">
        <!-- Notificaciones -->
        <div class="relative">
          <button
            type="button"
            (click)="alternarNotificaciones()"
            class="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            [class.bg-slate-100]="panel === 'notificaciones'"
            [attr.aria-expanded]="panel === 'notificaciones'"
            [attr.aria-label]="noLeidas > 0 ? 'Notificaciones: ' + noLeidas + ' sin leer' : 'Notificaciones'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              *ngIf="noLeidas > 0"
              class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
            >
              {{ noLeidas > 9 ? '9+' : noLeidas }}
            </span>
          </button>

          <div
            *ngIf="panel === 'notificaciones'"
            class="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in"
            role="dialog"
            aria-label="Notificaciones"
          >
            <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p class="text-sm font-bold text-slate-900">Notificaciones</p>
                <p class="text-[11px] text-slate-500">{{ noLeidas > 0 ? noLeidas + ' sin leer' : 'Estás al día' }}</p>
              </div>
              <button
                *ngIf="noLeidas > 0"
                type="button"
                (click)="marcarTodas()"
                class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
              >
                Marcar todas como leídas
              </button>
            </div>

            <div class="max-h-96 overflow-y-auto divide-y divide-slate-100">
              <button
                *ngFor="let n of notificaciones"
                type="button"
                (click)="abrir(n)"
                class="w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 transition"
                [class.bg-emerald-50]="!n.leida"
              >
                <span class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" [ngClass]="estiloTipo(n.tipo).caja">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="estiloTipo(n.tipo).icono" />
                  </svg>
                </span>
                <span class="flex-1 min-w-0">
                  <span class="flex items-start justify-between gap-2">
                    <span class="text-sm font-semibold text-slate-900">{{ n.titulo }}</span>
                    <span *ngIf="!n.leida" class="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-label="Sin leer"></span>
                  </span>
                  <span class="block text-xs text-slate-600 mt-0.5">{{ n.mensaje }}</span>
                  <span class="block text-[11px] text-slate-400 mt-1">{{ tiempo(n.fecha) }}</span>
                </span>
              </button>

              <div *ngIf="notificaciones.length === 0" class="px-4 py-10 text-center">
                <p class="text-sm font-semibold text-slate-700">No tienes notificaciones</p>
                <p class="text-xs text-slate-500 mt-1">Aquí verás cuando tu nutricionista te asigne un plan o un reporte.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Perfil -->
        <div class="relative">
          <button
            type="button"
            (click)="alternarPerfil()"
            [attr.aria-expanded]="panel === 'perfil'"
            aria-label="Menú de la cuenta"
            class="flex items-center gap-3 pl-2 py-1 pr-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition"
          >
            <span class="text-right hidden sm:block pl-2">
              <span class="block text-xs font-semibold text-slate-800 leading-tight">Hola, {{ firstName }}</span>
              <span class="block text-[10px] text-slate-500 font-medium">{{ authService.rolPrincipal }}</span>
            </span>
            <span class="w-8 h-8 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-xs shadow-sm">
              {{ authService.userInitials }}
            </span>
            <svg class="w-4 h-4 text-slate-400 mr-1 hidden sm:block transition" [class.rotate-90]="panel === 'perfil'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            *ngIf="panel === 'perfil'"
            class="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in"
            role="menu"
          >
            <div class="px-4 py-3 border-b border-slate-100">
              <p class="text-sm font-bold text-slate-900 truncate">{{ authService.userName }}</p>
              <p class="text-xs text-slate-500 truncate">{{ authService.userEmail }}</p>
              <span class="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                {{ authService.rolPrincipal }}
              </span>
            </div>
            <a routerLink="/perfil" (click)="panel = null" role="menuitem"
               class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Mi perfil
            </a>
            <button type="button" (click)="authService.logout()" role="menuitem"
               class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition border-t border-slate-100">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() title = 'Salud corporal';

  readonly authService = inject(AuthService);
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  panel: 'notificaciones' | 'perfil' | null = null;
  notificaciones: NotificacionResponse[] = [];
  private intervalo?: ReturnType<typeof setInterval>;

  get noLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  get firstName(): string {
    return this.authService.userName.split(' ')[0];
  }

  get formattedDate(): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('es-ES', options).toUpperCase();
  }

  ngOnInit(): void {
    this.cargarNotificaciones();
    this.intervalo = setInterval(() => this.cargarNotificaciones(), INTERVALO_NOTIFICACIONES_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalo);
  }

  cargarNotificaciones(): void {
    this.notificacionesService.listar().subscribe({
      next: (lista) => this.notificaciones = lista,
      error: () => { /* la campana simplemente queda sin cambios */ },
    });
  }

  alternarNotificaciones(): void {
    this.panel = this.panel === 'notificaciones' ? null : 'notificaciones';
    if (this.panel) this.cargarNotificaciones();
  }

  alternarPerfil(): void {
    this.panel = this.panel === 'perfil' ? null : 'perfil';
  }

  abrir(n: NotificacionResponse): void {
    this.panel = null;
    if (!n.leida) {
      n.leida = true;
      this.notificacionesService.marcarLeida(n.id).subscribe({ error: () => n.leida = false });
    }
    this.router.navigateByUrl(RUTA_NOTIFICACION[n.tipo] ?? '/inicio');
  }

  marcarTodas(): void {
    const pendientes = this.notificaciones.filter(n => !n.leida);
    pendientes.forEach(n => n.leida = true);
    this.notificacionesService.marcarTodasLeidas().subscribe({
      error: () => pendientes.forEach(n => n.leida = false),
    });
  }

  tiempo(iso: string): string {
    return haceCuanto(iso);
  }

  estiloTipo(tipo: TipoNotificacion): { caja: string; icono: string } {
    switch (tipo) {
      case 'PLAN_ASIGNADO':
      case 'PLAN_ACTUALIZADO':
        return {
          caja: 'bg-emerald-100 text-emerald-700',
          icono: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        };
      case 'REPORTE_GENERADO':
        return {
          caja: 'bg-sky-100 text-sky-700',
          icono: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        };
      default:
        return {
          caja: 'bg-indigo-100 text-indigo-700',
          icono: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        };
    }
  }

  /** Cierra los paneles al hacer clic fuera o al pulsar Escape. */
  @HostListener('document:click', ['$event'])
  alHacerClicFuera(event: MouseEvent): void {
    if (this.panel && !this.host.nativeElement.contains(event.target as Node)) this.panel = null;
  }

  @HostListener('document:keydown.escape')
  alPulsarEscape(): void {
    this.panel = null;
  }
}
