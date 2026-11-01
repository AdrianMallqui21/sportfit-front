import { TestBed } from '@angular/core/testing';
import { A11NotificacionesAdministradorComponente } from './a11-notificaciones-administrador-componente';

describe('Acciones locales de las notificaciones A11', () => {
  it('selecciona detalles, conserva la lectura por notificación y elimina hasta vaciar el listado', async () => {
    await TestBed.configureTestingModule({
      imports: [A11NotificacionesAdministradorComponente],
    }).compileComponents();
    const vista = TestBed.createComponent(A11NotificacionesAdministradorComponente);
    const pagina = vista.nativeElement as HTMLElement;
    vista.detectChanges();

    function seleccionar(indice: number) {
      (pagina.querySelectorAll('.boton-ver-detalles')[indice] as HTMLButtonElement).click();
      vista.detectChanges();
    }

    expect(pagina.querySelectorAll('.tarjeta-notificacion')).toHaveLength(3);
    expect(pagina.querySelector('.contenido-detalle')).toBeNull();
    seleccionar(1);
    expect(pagina.querySelector('.titulo-notificacion-seleccionada')?.textContent).toContain('David');
    expect(pagina.querySelector('.descripcion-notificacion')?.textContent).toContain('una hora más tarde');
    (pagina.querySelector('.boton-marcar-leido') as HTMLButtonElement).click();
    vista.detectChanges();
    expect((pagina.querySelector('.boton-marcar-leido') as HTMLButtonElement).disabled).toBe(true);

    seleccionar(0);
    expect(pagina.querySelector('.titulo-notificacion-seleccionada')?.textContent).toContain('Daniel');
    expect((pagina.querySelector('.boton-marcar-leido') as HTMLButtonElement).disabled).toBe(false);
    seleccionar(1);
    expect((pagina.querySelector('.boton-marcar-leido') as HTMLButtonElement).disabled).toBe(true);
    (pagina.querySelector('.boton-eliminar-notificacion') as HTMLButtonElement).click();
    vista.detectChanges();
    expect(pagina.querySelectorAll('.tarjeta-notificacion')).toHaveLength(2);
    expect(pagina.querySelector('.contenido-detalle')).toBeNull();
    expect(pagina.querySelector('.lista-notificaciones')?.textContent).not.toContain('David');

    for (let indice = 0; indice < 2; indice++) {
      seleccionar(0);
      (pagina.querySelector('.boton-eliminar-notificacion') as HTMLButtonElement).click();
      vista.detectChanges();
    }
    expect(pagina.querySelectorAll('.tarjeta-notificacion')).toHaveLength(0);
    expect(pagina.querySelector('.listado-vacio')?.textContent).toContain('No tienes notificaciones.');
    expect(pagina.querySelector('.boton-eliminar-notificacion')).toBeNull();
  });
});
