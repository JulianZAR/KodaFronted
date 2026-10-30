import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="w-full bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
      <!-- Left: Dynamic Date & Section -->
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {{ formattedDate }}
        </p>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">
          {{ title }}
        </h2>
      </div>

      <!-- Right: Notifications & Profile Pill -->
      <div class="flex items-center gap-4">
        <!-- Notification Bell (Static UI according to guidelines) -->
        <button
          class="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          aria-label="Notificaciones"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </button>

        <!-- User Profile Pill -->
        <div class="flex items-center gap-3 pl-2 py-1 pr-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition cursor-pointer">
          <div class="text-right hidden sm:block pl-2">
            <p class="text-xs font-semibold text-slate-800 leading-tight">
              Hola, {{ firstName }}
            </p>
            <p class="text-[10px] text-slate-500 font-medium">
              Usuario
            </p>
          </div>
          <div class="w-8 h-8 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-xs shadow-sm">
            {{ authService.userInitials }}
          </div>
          <svg class="w-4 h-4 text-slate-400 mr-1 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() title: string = 'Salud corporal';

  readonly authService = inject(AuthService);

  get firstName(): string {
    return this.authService.userName.split(' ')[0] || 'Julian';
  }

  get formattedDate(): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = now.toLocaleDateString('es-ES', options);
    return dateStr.toUpperCase();
  }
}

