import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Attaches the Keycloak Bearer token to every outgoing API request.
 * Silently refreshes the token if it is about to expire.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return from(auth.refreshTokenIfNeeded()).pipe(
    switchMap(() => {
      if (!auth.token) return next(req);

      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${auth.token}` },
      });
      return next(authReq);
    }),
  );
};
