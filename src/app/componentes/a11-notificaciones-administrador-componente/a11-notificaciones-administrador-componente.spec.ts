import { TestBed } from '@angular/core/testing';
import { MatDialog, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { vi } from 'vitest';
import { A11NotificacionesAdministradorComponente } from './a11-notificaciones-administrador-componente';

describe('Eliminación de notificaciones con confirmación', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [A11NotificacionesAdministradorComponente],
      providers: [{
        provide: MAT_DIALOG_DEFAULT_OPTIONS,
        useValue: { enterAnimationDuration: 0, exitAnimationDuration: 0 },
      }],
    }).compileComponents();
  });

  afterEach(() => TestBed.inject(MatDialog).closeAll());

  it('conserva los datos al cancelar y elimina solo la seleccionada tras confirmar y pulsar Entendido', async () => {
    const vista = TestBed.createComponent(A11NotificacionesAdministradorComponente);
    const pagina = vista.nativeElement as HTMLElement;
    vista.detectChanges();
    (pagina.querySelectorAll('.boton-ver-detalles')[1] as HTMLButtonElement).click();
    vista.detectChanges();
    (pagina.querySelector('.boton-marcar-leido') as HTMLButtonElement).click();
    vista.detectChanges();

    function abrirConfirmacion() {
      (pagina.querySelector('.boton-eliminar-notificacion') as HTMLButtonElement).click();
      vista.detectChanges();
    }

    abrirConfirmacion();
    expect(pagina.querySelectorAll('.tarjeta-notificacion')).toHaveLength(3);
    expect(document.querySelector('#titulo-confirmar-eliminacion')?.textContent).toContain('¿Eliminar esta notificación?');
    (document.querySelector('.boton-cancelar-eliminacion') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0));
    vista.detectChanges();
    expect(pagina.querySelectorAll('.tarjeta-notificacion')).toHaveLength(3);
    expect(pagina.querySelector('.titulo-notificacion-seleccionada')?.textContent).toContain('David');
    expect((pagina.querySelector('.boton-marcar-leido') as HTMLButtonElement).disabled).toBe(true);
    expect(document.querySelector('#titulo-notificacion-eliminada')).toBeNull();

    abrirConfirmacion();
    (document.querySelector('.boton-confirmar-eliminacion') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(document.querySelector('#titulo-notificacion-eliminada')).not.toBeNull());
    vista.detectChanges();
    expect(pagina.querySelectorAll('.tarjeta-notificacion')).toHaveLength(2);
    expect(pagina.querySelector('.lista-notificaciones')?.textContent).not.toContain('David');
    expect(pagina.querySelector('.lista-notificaciones')?.textContent).toContain('Daniel');
    expect(pagina.querySelector('.lista-notificaciones')?.textContent).toContain('Miguel');

    (document.querySelector('.boton-entendido-eliminacion') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(TestBed.inject(MatDialog).openDialogs).toHaveLength(0));
    vista.detectChanges();
    expect(pagina.querySelector('.contenido-detalle')).toBeNull();
    expect(pagina.querySelectorAll('.tarjeta-notificacion')).toHaveLength(2);
  });
});
