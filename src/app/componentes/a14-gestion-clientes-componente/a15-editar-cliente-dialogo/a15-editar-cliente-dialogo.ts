import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ClienteModelo } from '../../../modelos/cliente-modelo';
import { ClienteServicio } from '../../../servicios/cliente-servicio';

@Component({
  selector: 'app-a15-editar-cliente-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './a15-editar-cliente-dialogo.html',
  styleUrl: './a15-editar-cliente-dialogo.css'
})
export class A15EditarClienteDialogo {
  private readonly fb = inject(FormBuilder);
  private readonly clienteService = inject(ClienteServicio);
  private readonly dialogRef = inject(MatDialogRef<A15EditarClienteDialogo>);
  readonly cliente: ClienteModelo = inject(MAT_DIALOG_DATA);

  formEdicion: FormGroup;
  errorEdicion = signal<string | null>(null);
  guardando = signal<boolean>(false);

  constructor() {
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    this.formEdicion = this.fb.group({
      nombre: [
        this.cliente?.nombre || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(soloLetras)]
      ],
      apellido: [
        this.cliente?.apellido || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(soloLetras)]
      ],
      dni: [
        this.cliente?.dni || '',
        [Validators.required, Validators.pattern(/^\d{8}$/)]
      ],
      telefono: [
        this.cliente?.telefono || '',
        [Validators.required, Validators.pattern(/^\d{9}$/)]
      ],
      correo: [
        this.cliente?.correo || '',
        [Validators.required, Validators.email, Validators.maxLength(100)]
      ]
    });
  }

  esCampoValido(campo: string): boolean {
    const control = this.formEdicion.get(campo);
    return !!control && control.valid && (control.dirty || control.touched);
  }

  guardarEdicion(): void {
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      this.errorEdicion.set('Corrige los campos marcados en rojo antes de actualizar.');
      return;
    }

    const c = this.cliente;
    if (!c) return;

    const extra = c as any;
    const datosActualizados: any = {
      idUsuario: c.idUsuario,
      nombre: this.formEdicion.value.nombre?.trim(),
      apellido: this.formEdicion.value.apellido?.trim(),
      dni: this.formEdicion.value.dni?.trim(),
      telefono: this.formEdicion.value.telefono?.trim(),
      correo: this.formEdicion.value.correo?.trim(),
      contrasenaHash: null,
      activo: c.activo ?? true,
      imgUsuario: c.imgUsuario ?? null,
      fCreacion: c.fCreacion,
      idRol: extra.rol?.idRol ?? extra.idRol ?? 1
    };

    this.errorEdicion.set(null);
    this.guardando.set(true);

    this.clienteService.actualizarCliente(datosActualizados).subscribe({
      next: (actualizado) => {
        this.guardando.set(false);
        this.dialogRef.close({ ...c, ...actualizado });
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'Error al actualizar la información del cliente.';
        this.errorEdicion.set(msg);
      }
    });
  }
}
