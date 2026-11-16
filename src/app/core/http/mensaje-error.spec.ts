import { HttpErrorResponse } from '@angular/common/http';
import { esEstado, mensajeDeError } from './mensaje-error';

describe('mensajeDeError', () => {
  it('usa el detalle en español que envía el backend (ProblemDetail)', () => {
    const err = new HttpErrorResponse({ status: 409, error: { detail: 'Registra tu estatura en tu perfil.' } });
    expect(mensajeDeError(err)).toBe('Registra tu estatura en tu perfil.');
  });

  it('explica cuándo no hay conexión, sesión o permisos', () => {
    expect(mensajeDeError(new HttpErrorResponse({ status: 0 }))).toContain('No se pudo conectar');
    expect(mensajeDeError(new HttpErrorResponse({ status: 401 }))).toContain('sesión expiró');
    expect(mensajeDeError(new HttpErrorResponse({ status: 403 }))).toContain('No tienes permisos');
  });

  it('usa el mensaje por defecto si no hay detalle', () => {
    expect(mensajeDeError(new HttpErrorResponse({ status: 500 }), 'Falló')).toBe('Falló');
    expect(mensajeDeError(new Error('x'), 'Falló')).toBe('Falló');
  });

  it('reconoce el código de estado', () => {
    expect(esEstado(new HttpErrorResponse({ status: 409 }), 409)).toBeTrue();
    expect(esEstado(new HttpErrorResponse({ status: 404 }), 409)).toBeFalse();
    expect(esEstado(new Error('x'), 409)).toBeFalse();
  });
});
