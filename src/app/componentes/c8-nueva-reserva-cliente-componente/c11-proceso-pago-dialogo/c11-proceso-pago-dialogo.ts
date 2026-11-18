import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { PagoDialogoResultado, ResumenPagoDatos } from '../../../modelos/reserva-modelo';

// Diálogo de pago: muestra el resumen, el QR y pide la URL del comprobante.
// NO envía nada al back: al pulsar "Enviar solicitud de reserva" se cierra y le devuelve
// los datos del pago al componente c8, que es quien hace la llamada.
@Component({
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatButton,
    MatError,
    MatFormField,
    MatLabel,
    MatIcon,
    MatInput,
    MatSelect,
    MatOption,
    MatDialogClose,
  ],
  selector: 'app-c11-proceso-pago-dialogo',
  styleUrl: './c11-proceso-pago-dialogo.css',
  templateUrl: './c11-proceso-pago-dialogo.html',
})
export class C11ProcesoPagoDialogo {
  protected datos: ResumenPagoDatos = inject(MAT_DIALOG_DATA);
  private dialogRef: MatDialogRef<C11ProcesoPagoDialogo, PagoDialogoResultado> =
    inject(MatDialogRef);

  // Método de pago (por ahora solo Yape, como en el diseño)
  metodo = new FormControl('Yape', Validators.required);

  // URL del comprobante: obligatoria, debe empezar con http:// o https:// y tener máximo 500 caracteres
  urlComprobante = new FormControl('', [
    Validators.required,
    Validators.pattern(/^https?:\/\/\S+$/),
    Validators.maxLength(500),
  ]);

  // Se ejecuta al pulsar "Enviar solicitud de reserva": valida y cierra devolviendo los datos.
  enviar(): void {
    if (this.metodo.invalid || this.urlComprobante.invalid) {
      this.metodo.markAsTouched();
      this.urlComprobante.markAsTouched();
      return;
    }
    this.dialogRef.close({
      metodo: this.metodo.value!,
      urlComprobante: this.urlComprobante.value!.trim(),
    });
  }
}
