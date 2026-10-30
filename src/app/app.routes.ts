import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
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
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
