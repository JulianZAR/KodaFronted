import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

/**
 * Puerta de entrada: el formulario real lo muestra Keycloak con el tema
 * "nutrigo" (mismo diseño que la app). Aquí solo se redirige, o se informa
 * si Keycloak no está disponible.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen w-full bg-[#070c1c] flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center">
        <div class="flex items-center justify-center gap-3 mb-8">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 01-9-9c0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9 0 1.25-.26 2.44-.73 3.52M12 3v18m0-9h9" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 14l2 2 4-4" />
            </svg>
          </div>
          <span class="text-2xl font-bold tracking-tight text-slate-900">Nutri<span class="text-emerald-600">GO</span></span>
        </div>

        <ng-container *ngIf="!errorMessage; else error">
          <svg class="animate-spin w-8 h-8 text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p class="text-sm text-slate-500">Redirigiendo al inicio de sesión...</p>
        </ng-container>

        <ng-template #error>
          <div class="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm text-left">
            {{ errorMessage }}
          </div>
          <button
            type="button"
            (click)="reintentar()"
            class="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition"
          >
            Reintentar
          </button>
        </ng-template>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  errorMessage = '';

  ngOnInit(): void {
    const destino = this.destinoSeguro(this.route.snapshot.queryParamMap.get('redirect'));

    if (this.authService.isAuthenticated) {
      this.router.navigateByUrl(destino);
      return;
    }
    if (!this.authService.disponible) {
      this.errorMessage = 'No se pudo conectar con el servidor de autenticación (Keycloak). '
        + 'Verifica que esté en ejecución e inténtalo de nuevo.';
      return;
    }
    this.authService.login(destino).catch(() => {
      this.errorMessage = 'No se pudo abrir la pantalla de inicio de sesión.';
    });
  }

  reintentar(): void {
    window.location.reload();
  }

  /** Solo rutas internas de la app (evita redirecciones abiertas). */
  private destinoSeguro(ruta: string | null): string {
    return ruta && ruta.startsWith('/') && !ruta.startsWith('//') && !ruta.startsWith('/login')
      ? ruta
      : '/inicio';
  }
}
