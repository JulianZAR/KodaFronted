import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  rememberMe = true;
  showPassword = false;
  loading = false;
  errorMessage = '';

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const ok = await this.authService.login(this.email, this.password);
      if (ok) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Credenciales inválidas. Por favor intenta de nuevo.';
      }
    } catch {
      this.errorMessage = 'No se pudo conectar al servidor de autenticación.';
    } finally {
      this.loading = false;
    }
  }
}
