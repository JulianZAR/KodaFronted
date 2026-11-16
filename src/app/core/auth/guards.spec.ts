import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';
import { rolGuard } from './rol.guard';

describe('guards de autenticación y rol', () => {
  let auth: { isAuthenticated: boolean; roles: string[]; tieneRol: (r: string) => boolean };
  let router: Router;

  const estado = (url: string) => ({ url } as RouterStateSnapshot);
  const ruta = {} as ActivatedRouteSnapshot;
  const ejecutar = (guard: any, url: string) => TestBed.runInInjectionContext(() => guard(ruta, estado(url)));

  beforeEach(() => {
    auth = {
      isAuthenticated: true,
      roles: ['USER'],
      tieneRol(r: string) { return this.roles.includes(r); },
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    router = TestBed.inject(Router);
  });

  it('authGuard deja pasar con sesión y manda a /login (con la ruta pedida) sin ella', () => {
    expect(ejecutar(authGuard, '/progreso')).toBeTrue();

    auth.isAuthenticated = false;
    const destino = ejecutar(authGuard, '/progreso') as UrlTree;
    expect(router.serializeUrl(destino)).toBe('/login?redirect=%2Fprogreso');
  });

  it('un USER no entra a pacientes ni a administración', () => {
    const pacientes = ejecutar(rolGuard('NUTRITIONIST', 'ADMIN'), '/pacientes') as UrlTree;
    const admin = ejecutar(rolGuard('ADMIN'), '/admin/usuarios') as UrlTree;
    expect(router.serializeUrl(pacientes)).toBe('/inicio');
    expect(router.serializeUrl(admin)).toBe('/inicio');
  });

  it('un NUTRITIONIST entra a pacientes pero no a administración', () => {
    auth.roles = ['USER', 'NUTRITIONIST'];
    expect(ejecutar(rolGuard('NUTRITIONIST', 'ADMIN'), '/pacientes')).toBeTrue();
    expect(router.serializeUrl(ejecutar(rolGuard('ADMIN'), '/admin/usuarios') as UrlTree)).toBe('/inicio');
  });

  it('un ADMIN entra a todo', () => {
    auth.roles = ['USER', 'ADMIN'];
    expect(ejecutar(rolGuard('NUTRITIONIST', 'ADMIN'), '/pacientes')).toBeTrue();
    expect(ejecutar(rolGuard('ADMIN'), '/admin/usuarios')).toBeTrue();
  });
});
