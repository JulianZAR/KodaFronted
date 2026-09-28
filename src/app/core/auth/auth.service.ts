import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

/**
 * Wraps the Keycloak JS adapter as a singleton Angular service.
 * Handles initialization, token refresh and auth state.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly keycloak = new Keycloak({
    url:      environment.keycloak.url,
    realm:    environment.keycloak.realm,
    clientId: environment.keycloak.clientId,
  });

  private _initialized = false;

  /** Initialize Keycloak. Called once from app bootstrap. */
  async init(): Promise<boolean> {
    if (this._initialized) return this.keycloak.authenticated ?? false;

    const authenticated = await this.keycloak.init({
      onLoad:             'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      pkceMethod:         'S256',
      checkLoginIframe:   false,
    });

    this._initialized = true;
    return authenticated;
  }

  get isAuthenticated(): boolean {
    return this.keycloak.authenticated ?? false;
  }

  get token(): string | undefined {
    return this.keycloak.token;
  }

  get userName(): string {
    return (this.keycloak.tokenParsed?.['name'] as string) ?? '';
  }

  get userEmail(): string {
    return (this.keycloak.tokenParsed?.['email'] as string) ?? '';
  }

  /** Redirects to Keycloak login page. */
  login(): void {
    this.keycloak.login({ redirectUri: `${window.location.origin}/dashboard` });
  }

  /** Redirects to Keycloak logout page. */
  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  /** Refreshes the token if it expires in the next 30 seconds. */
  async refreshTokenIfNeeded(): Promise<void> {
    if (this.keycloak.authenticated) {
      await this.keycloak.updateToken(30);
    }
  }
}
