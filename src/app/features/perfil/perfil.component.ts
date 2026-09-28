import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService, PerfilResponse, ActualizarPerfilRequest, Meta } from '../../core/services/usuario.service';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [BottomNavComponent, FormsModule],
  template: `
    <div class="page">
      <!-- Header -->
      <header class="page-header animate-fade-in">
        <h1>Mi perfil</h1>
        <p class="text-muted" style="font-size:.9rem;margin-top:4px">
          Actualiza tus datos para obtener resultados precisos.
        </p>
      </header>

      @if (loading()) {
        <div class="loading-center"><div class="spinner"></div></div>
      } @else {

        <!-- Profile info card (read-only) -->
        <section class="card mb-md animate-fade-in-up" aria-label="Información de cuenta">
          <h2 class="mb-md">Información de cuenta</h2>
          <div class="info-row">
            <p class="info-label text-muted">Nombre</p>
            <p class="info-value">{{ perfil()?.nombre ?? '—' }}</p>
          </div>
          <hr class="divider">
          <div class="info-row">
            <p class="info-label text-muted">Correo</p>
            <p class="info-value">{{ perfil()?.email ?? '—' }}</p>
          </div>
          <hr class="divider">
          <div class="info-row">
            <p class="info-label text-muted">Miembro desde</p>
            <p class="info-value">{{ fechaRegistro() }}</p>
          </div>
        </section>

        <!-- Edit form card -->
        <section class="card animate-fade-in-up" aria-label="Datos nutricionales"
                 style="animation-delay:.07s">
          <h2 class="mb-md">Datos nutricionales</h2>

          @if (successMsg()) {
            <div class="alert" style="background:var(--green-light);color:var(--green-dark);
                        border:1px solid var(--green-mid); margin-bottom:var(--space-md);
                        border-radius:var(--radius-sm);padding:var(--space-md);font-size:.9rem;">
              {{ successMsg() }}
            </div>
          }
          @if (errorMsg()) {
            <div class="alert alert-error" style="margin-bottom:var(--space-md);">
              {{ errorMsg() }}
            </div>
          }

          <form id="form-perfil" (ngSubmit)="guardar()" #f="ngForm">
            <div class="form-group mb-md">
              <label class="form-label" for="estatura">Estatura (cm)</label>
              <input
                id="estatura"
                name="estatura"
                type="number"
                class="form-input"
                [(ngModel)]="estatura"
                min="100"
                max="250"
                step="0.5"
                required
                placeholder="Ej. 170"
                #estaturaField="ngModel"
              >
              @if (estaturaField.invalid && estaturaField.touched) {
                <p class="form-error">Ingresa una estatura válida (100 – 250 cm).</p>
              }
              <p class="form-hint">Solo necesitas ingresarla una vez; el peso se registra desde el progreso.</p>
            </div>

            <div class="form-group mb-md">
              <label class="form-label" for="meta">Meta nutricional</label>
              <select id="meta" name="meta" class="form-select" [(ngModel)]="meta" required>
                <option value="" disabled>Selecciona una meta</option>
                <option value="PERDER_PESO">Bajar peso</option>
                <option value="MANTENER">Mantener peso</option>
                <option value="GANAR_MASA">Ganar masa muscular</option>
              </select>
            </div>

            <button id="btn-guardar-perfil" type="submit"
                    class="btn btn-primary btn-block"
                    [disabled]="saving() || f.invalid">
              @if (saving()) {
                <span class="spinner" style="width:18px;height:18px;border-width:2px"></span>
                Guardando…
              } @else {
                Guardar cambios
              }
            </button>
          </form>
        </section>
      }
    </div>

    <app-bottom-nav />
  `,
  styles: [`
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-md);
    }
    .info-label { font-size: .875rem; flex-shrink: 0; }
    .info-value  { font-size: .9375rem; font-weight: 500; text-align: right; word-break: break-all; }
  `],
})
export class PerfilComponent implements OnInit {
  private perfilSvc = inject(UsuarioService);

  perfil    = signal<PerfilResponse | null>(null);
  loading   = signal(true);
  saving    = signal(false);
  successMsg = signal('');
  errorMsg   = signal('');

  // Form fields
  estatura = 0;
  meta: Meta | '' = '';

  ngOnInit(): void {
    this.perfilSvc.obtenerPerfil().subscribe({
      next: p => {
        this.perfil.set(p);
        this.estatura = p.estaturaCm ?? 0;
        this.meta     = p.meta ?? '';
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  fechaRegistro(): string {
    const f = this.perfil()?.fechaRegistro;
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  guardar(): void {
    if (!this.estatura || !this.meta) return;

    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');

    const payload: ActualizarPerfilRequest = {
      estaturaCm: this.estatura,
      meta:       this.meta as Meta,
    };

    this.perfilSvc.actualizarPerfil(payload).subscribe({
      next: p => {
        this.perfil.set(p);
        this.saving.set(false);
        this.successMsg.set('Perfil actualizado correctamente.');
        setTimeout(() => this.successMsg.set(''), 3500);
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('No se pudo guardar. Inténtalo de nuevo.');
      },
    });
  }
}
