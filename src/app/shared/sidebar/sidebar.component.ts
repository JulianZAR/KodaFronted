import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Hamburger Toggle -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <button
        (click)="isOpen = !isOpen"
        class="p-2.5 rounded-xl bg-[#0b132b] text-white shadow-lg border border-slate-700/50 hover:bg-slate-800 transition"
        aria-label="Abrir menú"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path *ngIf="!isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          <path *ngIf="isOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Backdrop for mobile -->
    <div
      *ngIf="isOpen"
      (click)="isOpen = false"
      class="lg:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity"
    ></div>

    <!-- Sidebar Aside -->
    <aside
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
      class="fixed inset-y-0 left-0 z-40 w-72 bg-[#0b132b] text-slate-200 flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0"
    >
      <!-- Top Section -->
      <div class="p-6">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <!-- Leaf Outline Logo -->
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 01-9-9c0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9 0 1.25-.26 2.44-.73 3.52M12 3v18m0-9h9" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l2 2 4-4" />
            </svg>
          </div>
          <div>
            <span class="text-2xl font-bold tracking-tight text-white flex items-center">
              Nutri<span class="text-emerald-400">GO</span>
            </span>
          </div>
        </div>

        <!-- Section Title -->
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400/90 px-3 mb-3">
          Menú Principal
        </p>

        <!-- Navigation Links -->
        <nav class="space-y-1.5" (click)="isOpen = false">
          <!-- Inicio -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-emerald-500/15 text-emerald-400 border-l-4 border-emerald-500 font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-normal text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Inicio</span>
          </a>

          <!-- Calculadora IMC -->
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-emerald-500/15 text-emerald-400 border-l-4 border-emerald-500 font-medium"
            class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-normal text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="2" stroke-width="1.8"/>
              <line x1="8" y1="6" x2="16" y2="6" stroke-width="1.8"/>
              <line x1="16" y1="14" x2="16" y2="18" stroke-width="1.8"/>
              <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>Calculadora IMC</span>
          </a>

          <!-- Mi Progreso -->
          <a
            routerLink="/progreso"
            routerLinkActive="bg-emerald-500/15 text-emerald-400 border-l-4 border-emerald-500 font-medium"
            class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-normal text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Mi Progreso</span>
          </a>

          <!-- Planes Nutricionales -->
          <a
            routerLink="/plan"
            routerLinkActive="bg-emerald-500/15 text-emerald-400 border-l-4 border-emerald-500 font-medium"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-normal text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
          >
            <div class="flex items-center gap-3.5">
              <svg class="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Planes Nutricionales</span>
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Nuevo
            </span>
          </a>

          <!-- Reportes -->
          <a
            routerLink="/reportes"
            routerLinkActive="bg-emerald-500/15 text-emerald-400 border-l-4 border-emerald-500 font-medium"
            class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-normal text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Reportes</span>
          </a>

          <!-- Perfil -->
          <a
            routerLink="/perfil"
            routerLinkActive="bg-emerald-500/15 text-emerald-400 border-l-4 border-emerald-500 font-medium"
            class="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-normal text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
          >
            <svg class="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Perfil</span>
          </a>
        </nav>
      </div>

      <!-- Bottom Section -->
      <div class="p-6 space-y-4">
        <!-- Weekly Goal Card (Static UI according to guidelines) -->
        <div class="p-4 rounded-2xl bg-[#131f37] border border-slate-700/60">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                <circle cx="12" cy="12" r="6" stroke-width="2"/>
                <circle cx="12" cy="12" r="2" stroke-width="2"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-white">Meta semanal</p>
              <p class="text-xs text-slate-400">4 de 5 objetivos</p>
            </div>
          </div>
          <!-- Progress bar -->
          <div class="w-full bg-slate-900 rounded-full h-2 mb-2 overflow-hidden">
            <div class="bg-emerald-500 h-2 rounded-full" style="width: 80%"></div>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">¡Un último esfuerzo!</p>
        </div>

        <!-- User Row with Logout -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold flex items-center justify-center text-xs shrink-0 border border-emerald-500/30">
              {{ authService.userInitials }}
            </div>
            <div class="truncate">
              <p class="text-sm font-medium text-white truncate">{{ authService.userName }}</p>
              <p class="text-xs text-slate-400 truncate">{{ authService.userEmail }}</p>
            </div>
          </div>
          <button
            (click)="authService.logout()"
            class="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly authService = inject(AuthService);
  isOpen = false;
}

