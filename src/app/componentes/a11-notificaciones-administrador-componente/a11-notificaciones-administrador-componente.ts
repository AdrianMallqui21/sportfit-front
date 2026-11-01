import { Component, computed, inject, signal, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';

interface NotificacionAdministrador {
  id: number;
  titulo: string;
  resumen: string;
  descripcion: string;
  tipo: string;
  fechaEnvio: string;
  horaEnvio: string;
  leida: boolean;
}

@Component({
  imports: [MatDialogClose],
  selector: 'app-a11-notificaciones-administrador-componente',
  styleUrl: './a11-notificaciones-administrador-componente.css',
  templateUrl: './a11-notificaciones-administrador-componente.html',
})
export class A11NotificacionesAdministradorComponente {
  private readonly dialogo = inject(MatDialog);
  // DATOS DE PRUEBA: eliminar al conectar el backend y cargar la lista desde el servicio.
  // Las acciones solo modifican esta lista en memoria; al recargar se restablece.
  readonly notificaciones = signal<NotificacionAdministrador[]>([
    {
      id: 1,
      titulo: 'Reporte del cliente Daniel',
      resumen: 'Daniel ha solicitado un cambio de sede para su reserva del 12/09/2026 a las 11:00 horas.',
      descripcion:
        'Daniel ha solicitado un cambio de sede para el día 12/09/2026 a las 11:00 horas. ' +
        'No podrá asistir a la sede seleccionada inicialmente y solicita otra sede disponible para la misma fecha y hora. ' +
        'Revise la solicitud y comuníquese con el cliente para confirmar el cambio.',
      tipo: 'Reporte',
      fechaEnvio: '28/08/2026',
      horaEnvio: '18:00',
      leida: false,
    },
    {
      id: 2,
      titulo: 'Reporte del cliente David',
      resumen: 'David ha reportado un inconveniente con el horario de su reserva.',
      descripcion:
        'David solicita revisar el horario de su reserva del 22/08/2026 a las 17:00 horas. ' +
        'Indica que necesita confirmar si puede iniciar su actividad una hora más tarde. ' +
        'Verifique la disponibilidad antes de responder al cliente.',
      tipo: 'Consulta de horario',
      fechaEnvio: '29/08/2026',
      horaEnvio: '09:30',
      leida: false,
    },
    {
      id: 3,
      titulo: 'Reporte del cliente Miguel',
      resumen: 'Miguel ha solicitado asistencia con la cancelación de su reserva.',
      descripcion:
        'Miguel solicita información para cancelar su reserva del 10/09/2026 a las 11:00 horas. ' +
        'El cliente indica que no podrá asistir por motivos personales. ' +
        'Revise las condiciones de cancelación y comuníquele los pasos correspondientes.',
      tipo: 'Solicitud de cancelación',
      fechaEnvio: '30/08/2026',
      horaEnvio: '14:15',
      leida: false,
    },
  ]);

  private readonly idSeleccionado = signal<number | null>(null);
  readonly notificacionSeleccionada = computed(
    () => this.notificaciones().find((notificacion) => notificacion.id === this.idSeleccionado()) ?? null,
  );

  verDetalles(id: number): void {
    this.idSeleccionado.set(id);
  }

  marcarComoLeido(): void {
    const seleccionada = this.notificacionSeleccionada();
    if (!seleccionada || seleccionada.leida) return;

    // Pendiente: persistir el cambio en el backend cuando se implemente el servicio.
    this.notificaciones.update((notificaciones) =>
      notificaciones.map((notificacion) =>
        notificacion.id === seleccionada.id ? { ...notificacion, leida: true } : notificacion,
      ),
    );
  }

  eliminarNotificacion(
    confirmacionEliminacion: TemplateRef<unknown>,
    notificacionEliminada: TemplateRef<unknown>,
  ): void {
    const seleccionada = this.notificacionSeleccionada();
    if (!seleccionada) return;

    const confirmacion = this.dialogo.open(confirmacionEliminacion, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      ariaLabelledBy: 'titulo-confirmar-eliminacion',
      ariaDescribedBy: 'descripcion-confirmar-eliminacion',
      autoFocus: '.boton-cancelar-eliminacion',
    });

    confirmacion.afterClosed().subscribe((eliminar: boolean | undefined) => {
      // No, Escape o clic en el fondo conservan la notificación y su detalle.
      if (eliminar !== true) return;

      // Simulación temporal: no hay solicitudes al backend ni recarga de página.
      this.notificaciones.update((notificaciones) =>
        notificaciones.filter((notificacion) => notificacion.id !== seleccionada.id),
      );
      if (this.idSeleccionado() === seleccionada.id) {
        this.idSeleccionado.set(null);
      }

      this.dialogo.open(notificacionEliminada, {
        width: '460px',
        maxWidth: 'calc(100vw - 32px)',
        ariaLabelledBy: 'titulo-notificacion-eliminada',
        ariaDescribedBy: 'descripcion-notificacion-eliminada',
        autoFocus: 'first-tabbable',
      });
    });
  }
}
