import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SedeCanchaModelo } from '../../../modelos/espacio-deportivo-modelo';
import { EspacioDeportivoServicio } from '../../../servicios/espacio-deportivo-servicio';

@Component({
  selector: 'app-a24-desactivar-espacio-dialogo',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './a24-desactivar-espacio-dialogo.html',
  styleUrl: './a24-desactivar-espacio-dialogo.css'
})
export class A24DesactivarEspacioDialogo {
  private readonly espacioServicio = inject(EspacioDeportivoServicio);
  private readonly dialogRef = inject(MatDialogRef<A24DesactivarEspacioDialogo>);

  procesando = signal<boolean>(false);
  confirmado = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public cancha: SedeCanchaModelo) {}

  confirmarDesactivacion(): void {
    this.procesando.set(true);
    this.errorMsg.set(null);

    this.espacioServicio.cambiarEstado(this.cancha.idSedeCancha, false).subscribe({
      next: () => {
        this.procesando.set(false);
        this.confirmado.set(true);
      },
      error: (err: unknown) => {
        this.procesando.set(false);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'Error al comunicarse con el backend para desactivar el espacio.';
        this.errorMsg.set(msg);
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(this.confirmado());
  }
}
