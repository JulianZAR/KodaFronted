import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Adjunta el token de Keycloak solo a las peticiones dirigidas a nuestra API
 * y lo renueva antes si está por expirar.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  const auth = inject(AuthService);

  return from(auth.refreshTokenIfNeeded()).pipe(
    switchMap(() => {
      const token = auth.token;
      if (!token) return next(req);
      return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
    }),
  );
};
