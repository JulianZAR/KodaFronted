import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" role="navigation" aria-label="Navegación principal">
      <a id="nav-dashboard" routerLink="/dashboard" routerLinkActive="active"
         class="nav-item" aria-label="Inicio">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9L12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </span>
        <span class="nav-label">Inicio</span>
      </a>

      <a id="nav-perfil" routerLink="/perfil" routerLinkActive="active"
         class="nav-item" aria-label="Perfil">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
        <span class="nav-label">Perfil</span>
      </a>

      <button id="nav-logout" class="nav-item nav-logout" (click)="logout()"
              aria-label="Cerrar sesión">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </span>
        <span class="nav-label">Salir</span>
      </button>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--nav-h);
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 100;
      padding-bottom: env(safe-area-inset-bottom, 0);
      box-shadow: 0 -2px 16px rgba(0,0,0,.06);
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
      text-decoration: none;
      padding: 8px 20px;
      border-radius: var(--radius-md);
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
      transition: color var(--transition), background var(--transition);
      flex: 1;
    }
    .nav-item:hover,
    .nav-item.active {
      color: var(--green-dark);
    }
    .nav-item.active .nav-icon {
      background: var(--green-light);
      border-radius: var(--radius-sm);
    }

    .nav-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: background var(--transition);
    }

    .nav-icon svg {
      width: 20px;
      height: 20px;
    }

    .nav-label {
      font-size: .6875rem;
      font-weight: 500;
    }

    .nav-logout:hover {
      color: var(--danger);
    }
  `],
})
export class BottomNavComponent {
  private auth = inject(AuthService);

  logout(): void {
    this.auth.logout();
  }
}
