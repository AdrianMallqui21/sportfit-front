import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ClienteModelo } from '../../../modelos/cliente-modelo';
import { ClienteServicio } from '../../../servicios/cliente-servicio';

@Component({
  selector: 'app-a17-desactivar-cliente-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogClose,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './a17-desactivar-cliente-dialogo.html',
  styleUrl: './a17-desactivar-cliente-dialogo.css'
})
export class A17DesactivarClienteDialogo {
  private readonly clienteService = inject(ClienteServicio);
  private readonly dialogRef = inject(MatDialogRef<A17DesactivarClienteDialogo>);
  readonly cliente: ClienteModelo = inject(MAT_DIALOG_DATA);

  procesando = signal<boolean>(false);
  errorCambio = signal<string | null>(null);

  confirmarCambioEstado(): void {
    if (!this.cliente) return;
    const nuevoEstado = !this.cliente.activo;
    this.procesando.set(true);
    this.errorCambio.set(null);

    this.clienteService.cambiarEstado(this.cliente.idUsuario, nuevoEstado).subscribe({
      next: () => {
        this.procesando.set(false);
        this.dialogRef.close({ ...this.cliente, activo: nuevoEstado });
      },
      error: () => {
        this.procesando.set(false);
        this.errorCambio.set('Error al cambiar el estado del usuario.');
      }
    });
  }
}
