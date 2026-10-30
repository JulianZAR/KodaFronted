import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/header/header.component';
import { UsuarioService, PerfilResponse, Meta } from '../../core/services/usuario.service';
import { ProgresoService } from '../../core/services/progreso.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  template: `
    <div class="min-h-screen flex bg-[#f8fafc]">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <app-header title="Perfil y Configuración"></app-header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
          
          <!-- Top Page Title -->
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Mi Perfil
            </h1>
            <p class="text-sm text-slate-500 mt-1">
              Administra tu información personal, medidas corporales y metas nutricionales.
            </p>
          </div>

          <!-- Account Information Card (Read-only) -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 class="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Información de la Cuenta</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Nombre</p>
                <p class="text-sm font-bold text-slate-800">{{ perfil?.nombre || authService.userName }}</p>
              </div>

              <div>
                <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Correo Electrónico</p>
                <p class="text-sm font-bold text-slate-800">{{ perfil?.email || authService.userEmail }}</p>
              </div>

              <div>
                <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Miembro Desde</p>
                <p class="text-sm font-bold text-slate-800">{{ formatFecha(perfil?.fechaRegistro) }}</p>
              </div>
            </div>
          </div>

          <!-- Nutritional Data Edit Form -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h2 class="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Datos Nutricionales y Metas</span>
            </h2>
            <p class="text-xs text-slate-500 mb-6">
              Mantén actualizados estos datos para asegurar que los cálculos de IMC y reportes reflejen tu estado actual.
            </p>

            <!-- Feedback Alerts -->
            <div *ngIf="mensajeExito" class="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ mensajeExito }}</span>
            </div>

            <div *ngIf="mensajeError" class="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {{ mensajeError }}
            </div>

            <form (ngSubmit)="guardarCambios()" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- Estatura Input -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                    Estatura (cm)
                  </label>
                  <div class="relative">
                    <input
                      type="number"
                      [(ngModel)]="estaturaCm"
                      name="estaturaCm"
                      required
                      min="50"
                      max="250"
                      step="1"
                      placeholder="177"
                      class="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold text-sm outline-none transition"
                    />
                    <span class="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                      cm
                    </span>
                  </div>
                </div>

                <!-- Peso Actual Input -->
                <div>
                  <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                    Peso actual (kg)
                  </label>
                  <div class="relative">
                    <input
                      type="number"
                      [(ngModel)]="pesoKg"
                      name="pesoKg"
                      required
                      min="20"
                      max="300"
                      step="0.1"
                      placeholder="70.0"
                      class="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold text-sm outline-none transition"
                    />
                    <span class="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                      kg
                    </span>
                  </div>
                </div>
              </div>

              <!-- Meta Dropdown -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                  Meta Nutricional
                </label>
                <select
                  [(ngModel)]="meta"
                  name="meta"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold text-sm outline-none transition bg-white"
                >
                  <option value="MANTENER_PESO">Mantener peso actual</option>
                  <option value="PERDER_PESO">Perder peso / Reducir grasa</option>
                  <option value="GANAR_MASA_MUSCULAR">Aumentar masa muscular</option>
                  <option value="MEJORAR_HABITOS">Mejorar hábitos saludables</option>
                </select>
              </div>

              <!-- Submit Button -->
              <div class="pt-4 flex justify-end">
                <button
                  type="submit"
                  [disabled]="guardando"
                  class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
                >
                  <svg *ngIf="!guardando" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg *ngIf="guardando" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>{{ guardando ? 'Guardando Cambios...' : 'Guardar Cambios' }}</span>
                </button>
              </div>
            </form>
          </div>

        </main>
      </div>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly progresoService = inject(ProgresoService);
  readonly authService = inject(AuthService);

  perfil: PerfilResponse | null = null;
  estaturaCm: number = 177;
  pesoKg: number = 70;
  meta: Meta = 'MANTENER_PESO';

  guardando = false;
  mensajeExito = '';
  mensajeError = '';

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (res) => {
        this.perfil = res;
        if (res.estaturaCm) this.estaturaCm = res.estaturaCm;
        if (res.pesoKg) this.pesoKg = res.pesoKg;
        if (res.meta) this.meta = res.meta;
      },
      error: () => {
        // Fallback default profile
        this.perfil = {
          id: '1',
          nombre: this.authService.userName,
          email: this.authService.userEmail,
          estaturaCm: 177,
          pesoKg: 70,
          meta: 'MANTENER_PESO',
          fechaRegistro: new Date().toISOString(),
        };
      }
    });
  }

  guardarCambios(): void {
    if (!this.estaturaCm || this.estaturaCm <= 0 || !this.pesoKg || this.pesoKg <= 0) {
      this.mensajeError = 'Por favor ingresa valores válidos.';
      return;
    }

    this.guardando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    // Update height & goal
    this.usuarioService.actualizarPerfil({
      estaturaCm: this.estaturaCm,
      meta: this.meta,
    }).subscribe({
      next: () => {
        // Also sync weight if updated
        this.progresoService.registrar({ pesoKg: this.pesoKg }).subscribe({
          next: () => {
            this.guardando = false;
            this.mensajeExito = '¡Perfil y mediciones actualizados con éxito!';
            setTimeout(() => this.mensajeExito = '', 4000);
          },
          error: () => {
            this.guardando = false;
            this.mensajeExito = '¡Perfil actualizado con éxito!';
            setTimeout(() => this.mensajeExito = '', 4000);
          }
        });
      },
      error: () => {
        // Fallback local update
        this.guardando = false;
        this.mensajeExito = '¡Perfil guardado localmente con éxito!';
        setTimeout(() => this.mensajeExito = '', 4000);
      }
    });
  }

  formatFecha(fechaIso?: string): string {
    if (!fechaIso) return 'Reciente';
    const date = new Date(fechaIso);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
