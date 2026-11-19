import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {finalize, switchMap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {AdministradorServicio} from '../../servicios/administrador-servicio';

import {A12ConfirmarEliminarDialogo} from './a12-confirmar-eliminar-dialogo/a12-confirmar-eliminar-dialogo';
import {A13ConfirmadoDialogo} from './a13-confirmado-dialogo/a13-confirmado-dialogo';

interface Notificacion {
  idNotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  fNotificacion: string;
  leido: boolean;
}

@Component({
  selector: 'app-a11-notificaciones-administrador-componente',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  providers: [AdministradorServicio],
  templateUrl: './a11-notificaciones-administrador-componente.html',
  styleUrl: './a11-notificaciones-administrador-componente.css',
})
export class A11NotificacionesAdministradorComponente implements OnInit {
  nombre = '';
  notificaciones: Notificacion[] = [];
  seleccionada: Notificacion | null = null;
  cargando = true;
  procesando = false;
  error = '';
  private readonly administradorServicio = inject(AdministradorServicio);
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly api = environment.apiUrl;

  ngOnInit(): void {
    const correo = this.obtenerCorreoSesion();

    if (!correo) {
      this.error = 'Inicia sesión como administrador para ver tus notificaciones.';
      this.cargando = false;
      return;
    }

    this.administradorServicio.obtenerAdministradorCorreo(correo, 2).pipe(
      switchMap((usuario) => {
        this.nombre = usuario.nombre;
        return this.http.get<Notificacion[]>(
          `${this.api}/notificacion/cliente/${usuario.idUsuario}`,
        );
      }),
      finalize(() => {
        this.cargando = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: (notificaciones) => {
        this.notificaciones = notificaciones;
        this.seleccionada = notificaciones[0] ?? null;
      },
      error: () => {
        this.error = 'No se pudieron cargar las notificaciones.';
      },
    });
  }

  seleccionar(notificacion: Notificacion): void {
    this.seleccionada = notificacion;
  }

  marcarComoLeida(): void {
    const notificacion = this.seleccionada;
    if (!notificacion || notificacion.leido || this.procesando) return;

    this.procesando = true;

    this.http.put(
      `${this.api}/notificacion-leida/${notificacion.idNotificacion}`,
      {},
    ).pipe(
      finalize(() => this.terminarAccion()),
    ).subscribe({
      next: () => {
        notificacion.leido = true;
      },
      error: () => this.mostrarError('No se pudo marcar la notificación como leída.'),
    });
  }

  abrirConfirmacion(): void {
    const notificacion = this.seleccionada;
    if (!notificacion || this.procesando) return;

    this.procesando = true;

    this.dialog.open(A12ConfirmarEliminarDialogo, {width: '340px', maxWidth: '90vw', autoFocus: '.boton-no'})
      .afterClosed()
      .subscribe((resultado) => {
        if (resultado !== true) {
          this.terminarAccion();
          return;
        }

        const id = notificacion.idNotificacion;

        this.http.delete<void>(`${this.api}/notificacion-eliminar/${id}`).pipe(
          finalize(() => this.terminarAccion()),
        ).subscribe({
          next: () => {
            this.notificaciones = this.notificaciones.filter(
              (item) => item.idNotificacion !== id,
            );

            if (this.seleccionada?.idNotificacion === id) {
              this.seleccionada = this.notificaciones[0] ?? null;
            }

            this.dialog.open(A13ConfirmadoDialogo, {width: '340px', maxWidth: '90vw'});
          },
          error: () => this.mostrarError('No se pudo eliminar la notificación.'),
        });
      });
  }

  private terminarAccion(): void {
    this.procesando = false;
    this.cdr.markForCheck();
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {duration: 3500});
  }

  private obtenerCorreoSesion(): string {
    const payload = localStorage.getItem('token')?.split('.')[1];
    if (!payload) return '';

    try {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
      const datos = JSON.parse(new TextDecoder().decode(bytes));

      return typeof datos.sub === 'string' ? datos.sub : '';
    } catch {
      return '';
    }
  }
}
