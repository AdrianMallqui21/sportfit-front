import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatDialogClose, MatDialogRef } from '@angular/material/dialog';

@Component({
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatDialogClose,
  ],
  selector: 'app-c14-confirmar-cancelacion-dialogo',
  styleUrl: './c14-confirmar-cancelacion-dialogo.css',
  templateUrl: './c14-confirmar-cancelacion-dialogo.html',
})
export class C14ConfirmarCancelacionDialogo {
  private dialogRef: MatDialogRef<C14ConfirmarCancelacionDialogo, string> = inject(MatDialogRef);

  readonly motivos = [
    'No podré asistir',
    'Problemas de salud',
    'Problemas de transporte',
    'Reservé por error',
    'Otro',
  ];

  motivo = new FormControl('', Validators.required);

  // Se ejecuta al pulsar "Sí": cierra el diálogo devolviendo el motivo elegido.
  confirmar(): void {
    if (this.motivo.invalid) return;
    this.dialogRef.close(this.motivo.value!);
  }
}
