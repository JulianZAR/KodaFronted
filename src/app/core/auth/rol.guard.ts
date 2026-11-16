import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Permite la ruta solo si el usuario tiene alguno de los roles indicados.
 * Es una ayuda de navegación: la autorización real la aplica el backend.
 */
export function rolGuard(...roles: string[]): CanActivateFn {
  return (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated) {
      return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
    }
    return roles.some(rol => auth.tieneRol(rol)) ? true : router.createUrlTree(['/inicio']);
  };
}
