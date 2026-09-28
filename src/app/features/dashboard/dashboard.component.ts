import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ImcService, ImcResponse, IMC_META } from '../../core/services/imc.service';
import { UsuarioService, PerfilResponse } from '../../core/services/usuario.service';
import { ProgresoService } from '../../core/services/progreso.service';
import { FormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [BottomNavComponent, RouterLink, DecimalPipe, FormsModule],
  template: `
    <div class="page stagger">
      <!-- Header -->
      <header class="page-header">
        <div class="greeting-row">
          <div>
            <p class="greeting-label text-muted">Buenos días,</p>
            <h1 class="greeting-name">{{ firstName() }}</h1>
          </div>
          <div class="avatar" aria-hidden="true">
            {{ initials() }}
          </div>
        </div>
      </header>

      <!-- IMC Card -->
      <section class="card imc-card" aria-label="Índice de masa corporal">
        <p class="card-section-label text-muted">Índice de masa corporal</p>

        @if (loadingImc()) {
          <div class="loading-center"><div class="spinner"></div></div>
        } @else if (imcError()) {
          <div class="imc-incomplete">
            <p class="text-muted">Aún no tienes datos suficientes para calcular tu IMC.</p>
            <form (ngSubmit)="registrarPeso()" class="mt-md" style="display: flex; gap: var(--space-sm);">
              <input type="number" class="form-input" placeholder="Peso (kg)" [(ngModel)]="nuevoPeso" name="nuevoPeso" required min="30" max="300" step="0.1" style="flex: 1;">
              <button type="submit" class="btn btn-primary" [disabled]="savingPeso()">Guardar</button>
            </form>
            @if (pesoError()) {
              <p class="form-error mt-sm">{{ pesoError() }}</p>
            }
          </div>
        } @else if (imcData()) {
          <div class="imc-display animate-scale-in">
            <div class="imc-gauge" [style.--progress]="imcProgress()">
              <svg viewBox="0 0 120 120" class="gauge-svg" aria-hidden="true">
                <circle class="gauge-track" cx="60" cy="60" r="48"
                        fill="none" stroke="var(--green-light)" stroke-width="10"/>
                <circle class="gauge-fill" cx="60" cy="60" r="48"
                        fill="none"
                        [attr.stroke]="imcGaugeColor()"
                        stroke-width="10"
                        stroke-linecap="round"
                        stroke-dasharray="301.6"
                        [attr.stroke-dashoffset]="imcDashOffset()"/>
              </svg>
              <div class="gauge-center">
                <span class="imc-value">{{ imcData()!.valor | number:'1.1-1' }}</span>
                <span class="imc-unit text-muted">kg/m²</span>
              </div>
            </div>
            <div class="imc-details">
              <span class="badge" [class]="imcBadgeClass()">
                {{ imcLabel() }}
              </span>
              <p class="imc-hint text-muted mt-sm">
                {{ imcHintText() }}
              </p>
            </div>
          </div>
          <div class="mt-md" style="text-align: right;">
             <form (ngSubmit)="registrarPeso()" style="display: flex; gap: var(--space-sm); justify-content: flex-end;">
               <input type="number" class="form-input" placeholder="Actualizar peso (kg)" [(ngModel)]="nuevoPeso" name="nuevoPeso" required min="30" max="300" step="0.1" style="max-width: 150px;">
               <button type="submit" class="btn btn-outline btn-sm" [disabled]="savingPeso()">Actualizar</button>
             </form>
             @if (pesoError()) {
               <p class="form-error mt-sm text-center">{{ pesoError() }}</p>
             }
          </div>
        }
      </section>

      <!-- Profile summary card -->
      <section class="card profile-card" aria-label="Resumen del perfil">
        <div class="profile-card-header">
          <h2>Mi perfil</h2>
          <a id="btn-editar-perfil" routerLink="/perfil" class="btn btn-ghost btn-sm">
            Editar
          </a>
        </div>

        @if (loadingPerfil()) {
          <div class="loading-center"><div class="spinner"></div></div>
        } @else if (perfil()) {
          <div class="profile-stats stagger">
            <div class="stat-item">
              <p class="stat-label text-muted">Estatura</p>
              <p class="stat-value">
                @if (perfil()!.estaturaCm) {
                  {{ perfil()!.estaturaCm }} <small class="text-muted">cm</small>
                } @else {
                  <span class="text-muted">—</span>
                }
              </p>
            </div>
            <div class="stat-item">
              <p class="stat-label text-muted">Peso actual</p>
              <p class="stat-value">
                @if (perfil()!.pesoKg) {
                  {{ perfil()!.pesoKg }} <small class="text-muted">kg</small>
                } @else {
                  <span class="text-muted">—</span>
                }
              </p>
            </div>
            <div class="stat-item">
              <p class="stat-label text-muted">Meta</p>
              <p class="stat-value">{{ metaLabel() }}</p>
            </div>
          </div>
        }
      </section>
    </div>

    <app-bottom-nav />
  `,
  styles: [`
    /* Greeting */
    .greeting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .greeting-label { font-size: .875rem; margin-bottom: 2px; }
    .greeting-name  { font-size: 1.375rem; font-weight: 700; }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--green-light);
      color: var(--green-dark);
      font-weight: 600;
      font-size: .9375rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* IMC Card */
    .imc-card { margin-bottom: var(--space-md); }
    .card-section-label { font-size: .8125rem; margin-bottom: var(--space-md); }

    .imc-incomplete { text-align: center; padding: var(--space-lg) 0; }

    .imc-display {
      display: flex;
      align-items: center;
      gap: var(--space-lg);
    }

    .imc-gauge {
      position: relative;
      width: 120px;
      height: 120px;
      flex-shrink: 0;
    }
    .gauge-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .gauge-fill {
      transition: stroke-dashoffset .8s ease, stroke .4s ease;
    }
    .gauge-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .imc-value { font-size: 1.5rem; font-weight: 700; line-height: 1; }
    .imc-unit  { font-size: .6875rem; }

    .imc-details { flex: 1; }
    .imc-hint    { font-size: .8125rem; line-height: 1.5; }

    /* Profile card */
    .profile-card { margin-bottom: var(--space-md); }
    .profile-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-md);
    }
    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-md);
    }
    .stat-item { text-align: center; }
    .stat-label { font-size: .75rem; margin-bottom: 4px; }
    .stat-value { font-size: 1.0625rem; font-weight: 600; }
  `],
})
export class DashboardComponent implements OnInit {
  private auth    = inject(AuthService);
  private imcSvc  = inject(ImcService);
  private perfilSvc = inject(UsuarioService);
  private progresoSvc = inject(ProgresoService);

  loadingImc   = signal(true);
  loadingPerfil = signal(true);
  imcData       = signal<ImcResponse | null>(null);
  imcError      = signal(false);
  perfil        = signal<PerfilResponse | null>(null);
  
  // Weight form
  nuevoPeso = '';
  savingPeso = signal(false);
  pesoError = signal('');

  // Derived
  firstName = computed(() => {
    const name = this.auth.userName;
    return name ? name.split(' ')[0] : 'Usuario';
  });
  initials = computed(() => {
    const name = this.auth.userName;
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  });

  imcLabel    = computed(() => this.imcData() ? IMC_META[this.imcData()!.categoria].label : '');
  imcBadgeClass = computed(() => this.imcData() ? IMC_META[this.imcData()!.categoria].badge : '');

  imcProgress = computed(() => {
    const v = this.imcData()?.valor ?? 0;
    // Map IMC 10–40 to 0–1
    return Math.min(Math.max((v - 10) / 30, 0), 1);
  });

  imcDashOffset = computed(() => {
    const circumference = 2 * Math.PI * 48; // r=48
    return circumference * (1 - this.imcProgress());
  });

  imcGaugeColor = computed(() => {
    const cat = this.imcData()?.categoria;
    if (!cat) return 'var(--green-primary)';
    if (cat === 'PESO_NORMAL') return 'var(--green-primary)';
    if (cat === 'BAJO_PESO' || cat === 'SOBREPESO') return '#F59E0B';
    return '#EF4444';
  });

  imcHintText = computed(() => {
    const cat = this.imcData()?.categoria;
    const hints: Record<string, string> = {
      BAJO_PESO:    'Considera aumentar tu ingesta calórica de manera saludable.',
      PESO_NORMAL:  'Estás dentro del rango saludable. ¡Sigue así!',
      SOBREPESO:    'Una dieta balanceada y actividad física pueden ayudarte.',
      OBESIDAD_I:   'Se recomienda consultar a un profesional de la salud.',
      OBESIDAD_II:  'Se recomienda atención médica especializada.',
      OBESIDAD_III: 'Es importante buscar asesoría médica urgente.',
    };
    return cat ? (hints[cat] ?? '') : '';
  });

  metaLabel = computed(() => {
    const meta = this.perfil()?.meta;
    const labels: Record<string, string> = {
      PERDER_PESO:  'Bajar peso',
      MANTENER:     'Mantener peso',
      GANAR_MASA:   'Ganar músculo',
    };
    return meta ? (labels[meta] ?? '—') : '—';
  });

  ngOnInit(): void {
    this.perfilSvc.obtenerPerfil().subscribe({
      next:  p  => { this.perfil.set(p); this.loadingPerfil.set(false); },
      error: () => { this.loadingPerfil.set(false); },
    });

    this.imcSvc.miImcActual().subscribe({
      next:  imc => { this.imcData.set(imc); this.loadingImc.set(false); },
      error: ()  => { this.imcError.set(true); this.loadingImc.set(false); },
    });
  }

  registrarPeso(): void {
    const peso = parseFloat(this.nuevoPeso);
    if (!peso || isNaN(peso)) {
      this.pesoError.set('Ingresa un peso válido.');
      return;
    }
    
    // Check if height is configured first
    if (!this.perfil()?.estaturaCm) {
       this.pesoError.set('Debes configurar tu estatura en Perfil primero.');
       return;
    }

    this.savingPeso.set(true);
    this.pesoError.set('');

    this.progresoSvc.registrar({ pesoKg: peso }).subscribe({
      next: () => {
        this.savingPeso.set(false);
        this.nuevoPeso = '';
        this.loadingImc.set(true);
        this.imcError.set(false);
        // Reload IMC and Profile to get updated data
        this.ngOnInit();
      },
      error: () => {
        this.savingPeso.set(false);
        this.pesoError.set('Error al guardar el peso. Inténtalo de nuevo.');
      }
    });
  }
}
