import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { PlanService } from './plan.service';
import { NotificacionesService } from './notificaciones.service';
import { infoImc } from './imc.service';
import { etiquetaMeta } from './usuario.service';

describe('servicios HTTP', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('PlanService devuelve null cuando el usuario no tiene plan (404)', () => {
    let resultado: unknown = 'sin respuesta';
    TestBed.inject(PlanService).obtenerMiPlan().subscribe(p => resultado = p);
    http.expectOne(`${environment.apiUrl}/api/plans/me`).flush(null, { status: 404, statusText: 'Not Found' });
    expect(resultado).toBeNull();
  });

  it('PlanService propaga los demás errores', () => {
    let status = 0;
    TestBed.inject(PlanService).obtenerMiPlan().subscribe({ error: e => status = e.status });
    http.expectOne(`${environment.apiUrl}/api/plans/me`).flush(null, { status: 500, statusText: 'Error' });
    expect(status).toBe(500);
  });

  it('NotificacionesService usa las rutas del backend', () => {
    const servicio = TestBed.inject(NotificacionesService);
    servicio.listar().subscribe();
    servicio.marcarLeida('abc').subscribe();
    servicio.marcarTodasLeidas().subscribe();

    expect(http.expectOne(`${environment.apiUrl}/api/notifications`).request.method).toBe('GET');
    expect(http.expectOne(`${environment.apiUrl}/api/notifications/abc/read`).request.method).toBe('PATCH');
    expect(http.expectOne(`${environment.apiUrl}/api/notifications/read-all`).request.method).toBe('POST');
  });
});

describe('etiquetas compartidas con el backend', () => {
  it('reconoce las 4 categorías de IMC del backend', () => {
    expect(infoImc('BAJO_PESO')?.label).toBe('Bajo peso');
    expect(infoImc('NORMAL')?.label).toBe('Normal');
    expect(infoImc('SOBREPESO')?.label).toBe('Sobrepeso');
    expect(infoImc('OBESIDAD')?.label).toBe('Obesidad');
    expect(infoImc('PESO_NORMAL')).toBeNull();
    expect(infoImc(null)).toBeNull();
  });

  it('traduce las 4 metas del backend', () => {
    expect(etiquetaMeta('PERDER_PESO')).toBe('Perder peso / Reducir grasa');
    expect(etiquetaMeta('GANAR_MASA', true)).toBe('Superávit / Masa');
    expect(etiquetaMeta('MANTENER', true)).toBe('Mantenimiento');
    expect(etiquetaMeta('MEJORAR_HABITOS', true)).toBe('Hábitos saludables');
    expect(etiquetaMeta(null)).toBe('Sin definir');
  });
});
