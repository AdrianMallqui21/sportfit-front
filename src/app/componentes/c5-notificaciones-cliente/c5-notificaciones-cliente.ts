import {
  Component,
  OnInit,
  ChangeDetectorRef,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { ClienteServicio } from '../../servicios/cliente-servicio';
import { NotificacionServicio } from '../../servicios/notificacion-servicio';
import { NotificacionModelo } from '../../modelos/notificacion-modelo';
import { C6EliminarNotificacionDialogo } from './c6-eliminar-notificacion-dialogo/c6-eliminar-notificacion-dialogo';
import { C7EliminadaDialogo } from './c7-eliminada-dialogo/c7-eliminada-dialogo';

@Component({
  selector: 'app-c5-notificaciones-cliente',
  imports: [
    CommonModule,
    BarraLateral,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './c5-notificaciones-cliente.html',
  styleUrl: './c5-notificaciones-cliente.css',
})
export class C5NotificacionesCliente implements OnInit {
  clienteServicio = inject(ClienteServicio);
  notificacionServicio = inject(NotificacionServicio);
  detector = inject(ChangeDetectorRef);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);

  nombre = '';
  notificaciones: NotificacionModelo[] = [];
  seleccionada: NotificacionModelo | null = null;
  cargando = true;
  procesando = false;
  error = '';

  ngOnInit() {
    const correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));

    this.clienteServicio.obtenerUsuario(correo, idRol).subscribe({
      next: (usuario) => {
        this.nombre = usuario.nombre;
        this.cargarNotificaciones(usuario.idUsuario);
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.error = 'No se pudo cargar el usuario.';
        this.cargando = false;
        this.detector.markForCheck();
      },
    });
  }

  cargarNotificaciones(idUsuario: number) {
    this.cargando = true;
    this.error = '';

    this.notificacionServicio.listarPorUsuario(idUsuario).subscribe({
      next: (data) => {
        this.notificaciones = data || [];
        this.seleccionada = this.notificaciones[0] || null;
        this.cargando = false;
        this.detector.markForCheck();
      },
      error: (error) => {
        console.error('Error al listar notificaciones:', error);
        this.error = 'No se pudieron cargar las notificaciones.';
        this.cargando = false;
        this.detector.markForCheck();
      },
    });
  }

  seleccionar(notificacion: NotificacionModelo) {
    this.seleccionada = notificacion;
  }

  marcarComoLeida() {
    if (!this.seleccionada || this.seleccionada.leido || this.procesando) return;

    this.procesando = true;

    this.notificacionServicio.marcarComoLeida(this.seleccionada.idNotificacion).subscribe({
      next: () => {
        if (this.seleccionada) this.seleccionada.leido = true;
        this.procesando = false;
        this.snackBar.open('Notificación marcada como leída', 'Cerrar', { duration: 3000 });
        this.detector.markForCheck();
      },
      error: (error) => {
        console.error('Error al marcar como leída:', error);
        this.procesando = false;
        this.snackBar.open('No se pudo actualizar la notificación', 'Cerrar', { duration: 3000 });
        this.detector.markForCheck();
      },
    });
  }

  abrirConfirmacion() {
    if (!this.seleccionada || this.procesando) return;

    this.dialog
      .open(C6EliminarNotificacionDialogo, {
        width: '340px',
        maxWidth: '90vw',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((confirmado) => {
        if (confirmado === true) {
          this.eliminar();
        }
      });
  }

  eliminar() {
    if (!this.seleccionada || this.procesando) return;

    const id = this.seleccionada.idNotificacion;
    this.procesando = true;

    this.notificacionServicio.eliminar(id).subscribe({
      next: () => {
        this.notificaciones = this.notificaciones.filter((n) => n.idNotificacion !== id);

        this.seleccionada = this.notificaciones[0] || null;
        this.procesando = false;

        this.dialog.open(C7EliminadaDialogo, {
          width: '340px',
          maxWidth: '90vw',
          disableClose: true,
        });

        this.detector.markForCheck();
      },
      error: (error) => {
        console.error('Error al eliminar:', error);
        this.procesando = false;
        this.snackBar.open('No se pudo eliminar la notificación', 'Cerrar', {
          duration: 3000,
        });
        this.detector.markForCheck();
      },
    });
  }

  icono(notificacion: NotificacionModelo): string {
    const texto = (notificacion.titulo + ' ' + notificacion.tipo).toLowerCase();
    if (texto.includes('cancel') || texto.includes('rechaz')) return 'warning_amber';
    if (texto.includes('confirm')) return 'task_alt';
    return 'event';
  }

  claseIcono(notificacion: NotificacionModelo): string {
    const texto = (notificacion.titulo + ' ' + notificacion.tipo).toLowerCase();
    if (texto.includes('cancel') || texto.includes('rechaz')) return 'icono-rojo';
    if (texto.includes('confirm')) return 'icono-amarillo';
    return 'icono-azul';
  }
}
