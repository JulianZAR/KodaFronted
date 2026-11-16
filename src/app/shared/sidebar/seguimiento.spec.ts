import { calcularSeguimiento } from './sidebar.component';

describe('tarjeta "Tu seguimiento"', () => {
  const ahora = new Date('2026-11-15T12:00:00Z');

  it('invita a registrar el primer pesaje si no hay ninguno', () => {
    const s = calcularSeguimiento(null, ahora);
    expect(s.alDia).toBeFalse();
    expect(s.porcentaje).toBe(0);
    expect(s.texto).toBe('Aún no registras tu peso');
  });

  it('está al día si el último pesaje fue hace menos de una semana', () => {
    const s = calcularSeguimiento('2026-11-14T12:00:00Z', ahora);
    expect(s.alDia).toBeTrue();
    expect(s.texto).toBe('Último pesaje ayer');
    expect(s.porcentaje).toBe(86);
  });

  it('pide registrar si pasaron 7 días o más', () => {
    const s = calcularSeguimiento('2026-11-05T12:00:00Z', ahora);
    expect(s.alDia).toBeFalse();
    expect(s.texto).toBe('Último pesaje hace 10 días');
  });
});
