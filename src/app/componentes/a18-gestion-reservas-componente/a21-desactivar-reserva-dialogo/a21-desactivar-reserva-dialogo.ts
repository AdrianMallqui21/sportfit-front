import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ReservaModelo } from '../../../modelos/solicitud-reserva-modelo';
import { ReservaServicio } from '../../../servicios/reserva-servicio';

@Component({
  selector: 'app-a21-desactivar-reserva-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogClose,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './a21-desactivar-reserva-dialogo.html',
  styleUrl: './a21-desactivar-reserva-dialogo.css'
})
export class A21DesactivarReservaDialogo {
  private readonly reservaServicio = inject(ReservaServicio);
  private readonly dialogRef = inject(MatDialogRef<A21DesactivarReservaDialogo>);
  readonly reserva: ReservaModelo = inject(MAT_DIALOG_DATA);

  procesando = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  confirmarCancelacion(): void {
    if (!this.reserva) return;
    this.procesando.set(true);
    this.errorMsg.set(null);

    this.reservaServicio.cancelarReserva(this.reserva.idReserva).subscribe({
      next: () => {
        this.procesando.set(false);
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        this.procesando.set(false);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'No se pudo cancelar la reserva.';
        this.errorMsg.set(msg);
      }
    });
  }
}
