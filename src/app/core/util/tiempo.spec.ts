import { diasDesde, haceCuanto, textoDias } from './tiempo';

describe('tiempo', () => {
  const ahora = new Date('2026-11-15T12:00:00Z');

  it('calcula los días completos transcurridos', () => {
    expect(diasDesde('2026-11-15T08:00:00Z', ahora)).toBe(0);
    expect(diasDesde('2026-11-14T11:00:00Z', ahora)).toBe(1);
    expect(diasDesde('2026-11-05T12:00:00Z', ahora)).toBe(10);
  });

  it('describe cuánto tiempo pasó en lenguaje natural', () => {
    expect(haceCuanto('2026-11-15T11:59:30Z', ahora)).toBe('hace un momento');
    expect(haceCuanto('2026-11-15T11:55:00Z', ahora)).toBe('hace 5 min');
    expect(haceCuanto('2026-11-15T09:00:00Z', ahora)).toBe('hace 3 h');
    expect(haceCuanto('2026-11-14T10:00:00Z', ahora)).toBe('ayer');
    expect(haceCuanto('2026-11-11T12:00:00Z', ahora)).toBe('hace 4 días');
  });

  it('nombra hoy, ayer y los días anteriores', () => {
    expect(textoDias(0)).toBe('hoy');
    expect(textoDias(1)).toBe('ayer');
    expect(textoDias(6)).toBe('hace 6 días');
  });
});
