import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

/**
 * Sesión del usuario gestionada 100 % por Keycloak (Authorization Code + PKCE).
 * El formulario de login lo pinta Keycloak con el tema "nutrigo", que replica
 * el diseño de la app; aquí nunca se manejan contraseñas.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly keycloak = new Keycloak({
    url: environment.keycloak.url,
    realm: environment.keycloak.realm,
    clientId: environment.keycloak.clientId,
  });

  private _disponible = false;
  private _inicializado = false;

  /** true si se pudo contactar con Keycloak al arrancar la app. */
  get disponible(): boolean {
    return this._disponible;
  }

  /** Comprueba en silencio si ya hay sesión SSO abierta (no redirige). */
  async init(): Promise<boolean> {
    if (this._inicializado) return this.isAuthenticated;
    this._inicializado = true;
    this.limpiarSesionAntigua();

    try {
      const autenticado = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });
      this._disponible = true;
      this.keycloak.onTokenExpired = () => {
        this.keycloak.updateToken(30).catch(() => this.login(this.rutaActual()));
      };
      return autenticado;
    } catch (err) {
      console.error('No se pudo conectar con Keycloak', err);
      this._disponible = false;
      return false;
    }
  }

  get isAuthenticated(): boolean {
    return Boolean(this.keycloak.authenticated);
  }

  get token(): string | undefined {
    return this.keycloak.token;
  }

  get userName(): string {
    const c = this.claims;
    const nombreCompleto = [c['given_name'], c['family_name']].filter(Boolean).join(' ');
    return (c['name'] as string) || nombreCompleto || (c['preferred_username'] as string) || this.userEmail || 'Usuario';
  }

  get userEmail(): string {
    return (this.claims['email'] as string) || '';
  }

  get userInitials(): string {
    const partes = this.userName.trim().split(/\s+/);
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0]?.substring(0, 2).toUpperCase() || 'US';
  }

  get roles(): string[] {
    const realmAccess = this.claims['realm_access'] as { roles?: string[] } | undefined;
    return realmAccess?.roles ?? [];
  }

  tieneRol(rol: string): boolean {
    return this.roles.includes(rol);
  }

  get esAdmin(): boolean {
    return this.tieneRol('ADMIN');
  }

  /** NUTRITIONIST o ADMIN: pueden gestionar pacientes y sus planes. */
  get esPersonalClinico(): boolean {
    return this.tieneRol('NUTRITIONIST') || this.tieneRol('ADMIN');
  }

  /** Id del usuario en Keycloak (claim "sub"). */
  get keycloakUserId(): string {
    return (this.claims['sub'] as string) || '';
  }

  /** Etiqueta del rol más alto, para mostrar en la cabecera. */
  get rolPrincipal(): string {
    if (this.tieneRol('ADMIN')) return 'Administrador';
    if (this.tieneRol('NUTRITIONIST')) return 'Nutricionista';
    return 'Usuario';
  }

  /** Redirige a la pantalla de login (tema NutriGO de Keycloak). */
  login(rutaDestino = '/inicio'): Promise<void> {
    return this.keycloak.login({ redirectUri: window.location.origin + rutaDestino });
  }

  /** Redirige directamente al formulario de registro de Keycloak. */
  register(): Promise<void> {
    return this.keycloak.register({ redirectUri: `${window.location.origin}/inicio` });
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: `${window.location.origin}/login` });
  }

  /** Renueva el access token si le quedan menos de 30 s; si no se puede, pide login. */
  async refreshTokenIfNeeded(): Promise<void> {
    if (!this.keycloak.authenticated) return;
    try {
      await this.keycloak.updateToken(30);
    } catch {
      await this.login(this.rutaActual());
    }
  }

  private get claims(): Record<string, unknown> {
    return (this.keycloak.tokenParsed ?? {}) as Record<string, unknown>;
  }

  private rutaActual(): string {
    return window.location.pathname + window.location.search;
  }

  /** La versión anterior guardaba un token (a veces falso) en localStorage. */
  private limpiarSesionAntigua(): void {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
    } catch {
      // localStorage no disponible: nada que limpiar
    }
  }
}
