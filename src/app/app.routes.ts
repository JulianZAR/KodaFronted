import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { rolGuard } from './core/auth/rol.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/inicio/inicio.component').then(m => m.InicioComponent),
  },
  // La calculadora de IMC antes vivía en /dashboard; se conserva la ruta vieja.
  {
    path: 'dashboard',
    redirectTo: 'calculadora',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'calculadora',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'progreso',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/progreso/progreso.component').then(m => m.ProgresoComponent),
  },
  {
    path: 'plan',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/plan/plan.component').then(m => m.PlanComponent),
  },
  {
    path: 'reportes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reportes/reportes.component').then(m => m.ReportesComponent),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/perfil/perfil.component').then(m => m.PerfilComponent),
  },
  // Personal clínico: NUTRITIONIST y ADMIN
  {
    path: 'pacientes',
    canActivate: [rolGuard('NUTRITIONIST', 'ADMIN')],
    loadComponent: () =>
      import('./features/pacientes/pacientes.component').then(m => m.PacientesComponent),
  },
  {
    path: 'pacientes/:id',
    canActivate: [rolGuard('NUTRITIONIST', 'ADMIN')],
    loadComponent: () =>
      import('./features/pacientes/paciente-detalle.component').then(m => m.PacienteDetalleComponent),
  },
  // Solo ADMIN
  {
    path: 'admin/usuarios',
    canActivate: [rolGuard('ADMIN')],
    loadComponent: () =>
      import('./features/admin/admin-usuarios.component').then(m => m.AdminUsuariosComponent),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
