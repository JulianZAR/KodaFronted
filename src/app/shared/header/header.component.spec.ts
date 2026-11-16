import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent (campana de notificaciones)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/api/notifications`;
  const notificacion = (id: string, leida: boolean) => ({
    id, tipo: 'PLAN_ASIGNADO', titulo: 'Plan ' + id, mensaje: 'm', leida, fecha: new Date().toISOString(),
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { userName: 'Laura Gómez', userEmail: 'laura@x', userInitials: 'LG', rolPrincipal: 'Usuario', logout() {} },
        },
      ],
    });
    fixture = TestBed.createComponent(HeaderComponent);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('muestra cuántas notificaciones sin leer hay', () => {
    http.expectOne(url).flush([notificacion('1', false), notificacion('2', false), notificacion('3', true)]);
    fixture.detectChanges();

    const boton: HTMLElement = fixture.nativeElement.querySelector('button[aria-label^="Notificaciones"]');
    expect(boton.getAttribute('aria-label')).toBe('Notificaciones: 2 sin leer');
    expect(boton.textContent).toContain('2');
  });

  it('"Marcar todas como leídas" llama al backend y vacía el contador', () => {
    http.expectOne(url).flush([notificacion('1', false)]);
    fixture.componentInstance.alternarNotificaciones();
    http.expectOne(url).flush([notificacion('1', false)]);
    fixture.detectChanges();

    const marcar = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(b => b.textContent?.includes('Marcar todas'))!;
    marcar.click();
    http.expectOne(`${url}/read-all`).flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(fixture.componentInstance.noLeidas).toBe(0);
  });
});
