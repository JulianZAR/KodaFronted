import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-page">
      <div class="login-card animate-fade-in-up">
        <!-- Logo placeholder -->
        <div class="logo-area">
          <div class="logo-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="var(--green-light)"/>
              <path d="M20 10 C14 10 10 15 10 20 C10 25 14 28 18 28 C18 22 22 18 28 18 C28 14 24 10 20 10Z"
                    fill="var(--green-primary)"/>
              <path d="M22 22 C22 28 18 30 20 30 C24 30 30 26 30 22 C28 22 24 22 22 22Z"
                    fill="var(--green-dark)" opacity=".7"/>
            </svg>
          </div>
          <h1 class="logo-text">Nutrigo</h1>
          <p class="logo-tagline">seguimiento nutricional personalizado</p>
        </div>

        <!-- Ilustración / descripción -->
        <div class="welcome-section">
          <p class="welcome-text">
            Registra tu peso, conoce tu IMC y lleva el control de tu
            progreso nutricional, todo en un solo lugar.
          </p>
        </div>

        <!-- Features list -->
        <ul class="feature-list" aria-label="Funcionalidades principales">
          <li class="feature-item">
            <span class="feature-dot" aria-hidden="true"></span>
            Cálculo automático de IMC
          </li>
          <li class="feature-item">
            <span class="feature-dot" aria-hidden="true"></span>
            Historial de progreso visual
          </li>
          <li class="feature-item">
            <span class="feature-dot" aria-hidden="true"></span>
            Perfil nutricional completo
          </li>
        </ul>

        <!-- CTA -->
        <button id="btn-login" class="btn btn-primary btn-block" (click)="login()">
          Iniciar sesión
        </button>

        <p class="login-footer">
          ¿Es tu primera vez? Keycloak te permitirá crear tu cuenta en el momento del login.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-lg) var(--space-md);
      background: linear-gradient(160deg, #F0FAF4 0%, var(--bg) 60%);
    }

    .login-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      padding: var(--space-xl);
      max-width: 400px;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }

    .logo-area {
      text-align: center;
      margin-bottom: var(--space-xl);
    }

    .logo-mark {
      width: 64px;
      height: 64px;
      margin: 0 auto var(--space-md);
    }

    .logo-mark svg {
      width: 100%;
      height: 100%;
    }

    .logo-text {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--green-dark);
      letter-spacing: -.03em;
      margin-bottom: var(--space-xs);
    }

    .logo-tagline {
      font-size: .875rem;
      color: var(--text-muted);
    }

    .welcome-section {
      margin-bottom: var(--space-lg);
    }

    .welcome-text {
      text-align: center;
      color: var(--text-muted);
      font-size: .9375rem;
      line-height: 1.6;
    }

    .feature-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      margin-bottom: var(--space-xl);
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      font-size: .9375rem;
      color: var(--text);
    }

    .feature-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green-primary);
      flex-shrink: 0;
    }

    .login-footer {
      margin-top: var(--space-md);
      text-align: center;
      font-size: .8125rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);

  login(): void {
    this.auth.login();
  }
}
