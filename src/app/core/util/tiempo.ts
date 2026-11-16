/** Días completos transcurridos desde una fecha ISO hasta ahora. */
export function diasDesde(iso: string, ahora: Date = new Date()): number {
  return Math.max(0, Math.floor((ahora.getTime() - new Date(iso).getTime()) / 86_400_000));
}

/** "hace un momento", "hace 5 min", "hace 3 h", "ayer", "hace 4 días", "12 oct 2026". */
export function haceCuanto(iso: string, ahora: Date = new Date()): string {
  const segundos = Math.floor((ahora.getTime() - new Date(iso).getTime()) / 1000);
  if (segundos < 60) return 'hace un momento';
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return 'ayer';
  if (dias < 30) return `hace ${dias} días`;
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Texto para "último pesaje": "hoy", "ayer" o "hace N días". */
export function textoDias(dias: number): string {
  if (dias === 0) return 'hoy';
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}
