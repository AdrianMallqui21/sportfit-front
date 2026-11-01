import { Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

interface IncidenciaAdministrador {
  id: number;
  codigo: string;
  cliente: string;
  tipo: string;
  fecha: string;
  hora: string;
  estado: 'Pendiente' | 'Atendido';
  descripcion: string;
  respuesta: string;
  fechaAtencion: string | null;
}

@Component({
  imports: [FormsModule, MatDialogModule],
  selector: 'app-a26-listado-incidencias-administrador-componente',
  templateUrl: './a26-listado-incidencias-administrador-componente.html',
  styleUrl: './a26-listado-incidencias-administrador-componente.css',
})
export class A26ListadoIncidenciasAdministradorComponente {
  private readonly dialogo = inject(MatDialog);
  private readonly confirmacionRespuesta = viewChild.required<TemplateRef<unknown>>('confirmacionRespuesta');
  // DATOS DE PRUEBA: eliminar al conectar el backend y obtener las incidencias del servicio.
  // Las acciones son locales y se restablecen al recargar la página.
  readonly incidencias = signal<IncidenciaAdministrador[]>([
    {
      id: 1, codigo: 'INC-1042', cliente: 'Carlos Méndez', tipo: 'Pagos',
      fecha: '2026-11-01', hora: '19:45', estado: 'Pendiente',
      descripcion: 'Realicé la reserva para las 19:00 horas y se me cobró dos veces en la pasarela de pagos. Solicito revisar el pago duplicado y las opciones de devolución.',
      respuesta: '', fechaAtencion: null,
    },
    {
      id: 2, codigo: 'INC-1041', cliente: 'Andrea Rivas', tipo: 'Instalaciones',
      fecha: '2026-10-31', hora: '16:20', estado: 'Pendiente',
      descripcion: 'La iluminación de la cancha presentó una falla durante nuestra reserva. Solicito una revisión de las instalaciones antes del siguiente turno.',
      respuesta: '', fechaAtencion: null,
    },
    {
      id: 3, codigo: 'INC-1040', cliente: 'Mateo Silva', tipo: 'Preguntas',
      fecha: '2026-11-01', hora: '09:15', estado: 'Atendido',
      descripcion: 'Quisiera saber si se puede modificar el horario de una reserva confirmada.',
      respuesta: 'Puedes solicitar el cambio de horario. El equipo revisará la disponibilidad de la cancha para el nuevo turno.',
      fechaAtencion: '2026-11-01',
    },
  ]);

  filtroTipo = '';
  filtroFecha = '';
  filtroEstado = '';
  private readonly filtrosAplicados = signal({ tipo: '', fecha: '', estado: '' });
  private readonly idSeleccionado = signal<number | null>(1);
  readonly respuesta = signal('');
  readonly errorRespuesta = signal('');

  readonly tipos = computed(() => [...new Set(this.incidencias().map((incidencia) => incidencia.tipo))]);
  readonly incidenciasFiltradas = computed(() => {
    const filtro = this.filtrosAplicados();
    return this.incidencias().filter((incidencia) =>
      (!filtro.tipo || incidencia.tipo === filtro.tipo) &&
      (!filtro.fecha || incidencia.fecha === filtro.fecha) &&
      (!filtro.estado || incidencia.estado === filtro.estado),
    );
  });
  readonly incidenciaSeleccionada = computed(() =>
    this.incidencias().find((incidencia) => incidencia.id === this.idSeleccionado()) ?? null,
  );
  readonly totalIncidencias = computed(() => this.incidencias().length);
  readonly pendientesMes = computed(() => this.incidencias().filter((incidencia) =>
    incidencia.estado === 'Pendiente' && incidencia.fecha.startsWith(this.mesActual()),
  ).length);
  readonly atendidasMes = computed(() => this.incidencias().filter((incidencia) =>
    incidencia.estado === 'Atendido' && incidencia.fechaAtencion?.startsWith(this.mesActual()),
  ).length);

  private mesActual(): string {
    return this.fechaActual().slice(0, 7);
  }

  private fechaActual(): string {
    const fecha = new Date();
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  mostrarFecha(fecha: string): string {
    return fecha.split('-').reverse().join('/');
  }

  seleccionarIncidencia(id: number): void {
    const incidencia = this.incidencias().find((elemento) => elemento.id === id);
    if (!incidencia) return;
    this.idSeleccionado.set(id);
    this.respuesta.set(incidencia.respuesta);
    this.errorRespuesta.set('');
  }

  buscarIncidencias(): void {
    this.filtrosAplicados.set({ tipo: this.filtroTipo, fecha: this.filtroFecha, estado: this.filtroEstado });
    if (!this.incidenciasFiltradas().some((incidencia) => incidencia.id === this.idSeleccionado())) {
      this.cancelarRespuesta();
    }
  }

  limpiarFiltros(): void {
    this.filtroTipo = '';
    this.filtroFecha = '';
    this.filtroEstado = '';
    this.filtrosAplicados.set({ tipo: '', fecha: '', estado: '' });
  }

  cancelarRespuesta(): void {
    this.idSeleccionado.set(null);
    this.respuesta.set('');
    this.errorRespuesta.set('');
  }

  enviarRespuesta(): void {
    const seleccionada = this.incidenciaSeleccionada();
    if (!seleccionada || seleccionada.estado === 'Atendido') return;
    const respuesta = this.respuesta().trim();
    if (!respuesta) {
      this.errorRespuesta.set('Escribe una respuesta antes de cerrar la incidencia.');
      return;
    }

    // Pendiente: enviar y guardar la respuesta en el backend. Por ahora, solo memoria.
    this.incidencias.update((incidencias) => incidencias.map((incidencia) =>
      incidencia.id === seleccionada.id
        ? { ...incidencia, respuesta, estado: 'Atendido', fechaAtencion: this.fechaActual() }
        : incidencia,
    ));
    // Simulación local: todavía no se guarda ni se notifica al cliente mediante un servicio.
    this.dialogo.open(this.confirmacionRespuesta(), { width: '480px', maxWidth: '92vw', ariaLabelledBy: 'titulo-respuesta-enviada', ariaDescribedBy: 'descripcion-respuesta-enviada' });
    this.respuesta.set(respuesta);
    this.errorRespuesta.set('');
    if (!this.incidenciasFiltradas().some((incidencia) => incidencia.id === seleccionada.id)) {
      this.cancelarRespuesta();
    }
  }
}

