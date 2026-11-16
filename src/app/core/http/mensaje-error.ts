import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte un error HTTP en un mensaje para el usuario. El backend responde
 * con ProblemDetail (RFC 7807), cuyo campo "detail" ya viene en español.
 */
export function mensajeDeError(err: unknown, porDefecto = 'Ocurrió un error inesperado. Intenta de nuevo.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.';
    }
    if (err.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    if (err.status === 403) return 'No tienes permisos para realizar esta acción.';

    const detalle = err.error?.detail;
    if (typeof detalle === 'string' && detalle.trim()) return detalle;
  }
  return porDefecto;
}

export function esEstado(err: unknown, status: number): boolean {
  return err instanceof HttpErrorResponse && err.status === status;
}
