import { TestBed } from '@angular/core/testing';
import { A26ListadoIncidenciasAdministradorComponente } from './a26-listado-incidencias-administrador-componente';

describe('Gestión local de incidencias', () => {
  it('filtra, valida la respuesta y conserva el cambio al volver a seleccionar', async () => {
    const fixture = TestBed.createComponent(A26ListadoIncidenciasAdministradorComponente);
    fixture.detectChanges();
    await fixture.whenStable();
    const componente = fixture.componentInstance;
    componente.filtroEstado = 'Pendiente';
    componente.buscarIncidencias();
    expect(componente.incidenciasFiltradas().length).toBe(2);
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.nombre-cliente')[1].click();
    fixture.detectChanges();
    expect(componente.incidenciaSeleccionada()?.cliente).toBe('Andrea Rivas');
    componente.respuesta.set('   ');
    componente.enviarRespuesta();
    expect(componente.errorRespuesta()).toBeTruthy();
    expect(componente.incidenciaSeleccionada()?.estado).toBe('Pendiente');
    componente.respuesta.set(' Revisaremos la iluminación. ');
    componente.enviarRespuesta();
    expect(componente.incidenciasFiltradas().length).toBe(1);
    expect(componente.incidenciaSeleccionada()).toBeNull();
    componente.limpiarFiltros();
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.nombre-cliente')[1].click();
    fixture.detectChanges();
    expect(componente.incidenciaSeleccionada()?.cliente).toBe('Andrea Rivas');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(componente.respuesta()).toBe('Revisaremos la iluminación.');
    expect(componente.incidenciaSeleccionada()?.estado).toBe('Atendido');
    expect(fixture.nativeElement.querySelector('.boton-enviar').disabled).toBe(true);
    componente.cancelarRespuesta();
    expect(componente.totalIncidencias()).toBe(3);
    expect(componente.incidenciaSeleccionada()).toBeNull();
  });
});

