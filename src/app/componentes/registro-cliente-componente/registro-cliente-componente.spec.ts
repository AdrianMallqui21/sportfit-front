import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';
import { RegistroClienteComponente } from './registro-cliente-componente';

describe('Confirmación del registro de cliente', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroClienteComponente],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MAT_DIALOG_DEFAULT_OPTIONS,
          useValue: { enterAnimationDuration: 0, exitAnimationDuration: 0 },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    TestBed.inject(MatDialog).closeAll();
  });

  function prepararFormulario() {
    const vista = TestBed.createComponent(RegistroClienteComponente);
    vista.detectChanges();
    const formulario = vista.nativeElement.querySelector('form') as HTMLFormElement;

    function escribir(nombre: string, valor: string) {
      const entrada = formulario.elements.namedItem(nombre) as HTMLInputElement;
      entrada.value = valor;
      entrada.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function completar() {
      escribir('nombres', 'Nombre');
      escribir('apellidos', 'Apellido');
      escribir('dni', '12345678');
      escribir('telefono', '987654321');
      escribir('correo', 'registro@example.com');
      escribir('contrasena', 'Prueba123!');
      escribir('confirmar-contrasena', 'Prueba123!');
    }

    function enviar() {
      const evento = new Event('submit', { bubbles: true, cancelable: true });
      formulario.dispatchEvent(evento);
      vista.detectChanges();
      expect(evento.defaultPrevented).toBe(true);
    }

    return { vista, formulario, escribir, completar, enviar };
  }

  it('no abre la confirmación si faltan campos o el correo es inválido', () => {
    const { completar, escribir, enviar } = prepararFormulario();
    enviar();
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);

    completar();
    escribir('correo', 'correo-invalido');
    enviar();
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
  });

  it('exige contraseñas iguales y permite corregirlas antes de confirmar', () => {
    const { completar, escribir, enviar, formulario } = prepararFormulario();
    completar();
    escribir('confirmar-contrasena', 'Otra123!');
    enviar();
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
    const confirmacion = formulario.elements.namedItem('confirmar-contrasena') as HTMLInputElement;
    expect(confirmacion.validationMessage).toBe('Las contraseñas deben coincidir.');

    escribir('contrasena', 'Otra123!');
    expect(confirmacion.validity.customError).toBe(false);
    enviar();
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
    TestBed.inject(HttpTestingController).expectOne('http://localhost:8080/api/auth/register').flush({});
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(1);
  });

  it('muestra la confirmación y cierra el diálogo para navegar al inicio de sesión', async () => {
    const { vista, completar, enviar } = prepararFormulario();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    completar();
    enviar();
    TestBed.inject(HttpTestingController).expectOne('http://localhost:8080/api/auth/register').flush({});
    await vista.whenStable();

    const dialogo = document.querySelector('mat-dialog-container') as HTMLElement;
    expect(dialogo.textContent).toContain('¡Registro completado!');
    (dialogo.querySelector('.boton-iniciar-sesion') as HTMLButtonElement).click();
    await vista.whenStable();

    await vi.waitFor(() => expect(navegar).toHaveBeenCalledWith('/'));
    expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0);
  });
});
