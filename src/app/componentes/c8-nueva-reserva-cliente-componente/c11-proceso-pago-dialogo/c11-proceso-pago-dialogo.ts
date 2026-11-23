import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { PagoDialogoResultado, ResumenPagoDatos } from '../../../modelos/reserva-modelo';
import { ImagenServicio } from '../../../servicios/imagen-servicio';

// Diálogo de pago: muestra el resumen, el QR y permite subir el comprobante a Cloudinary
// (o ingresar su URL). Al pulsar "Enviar solicitud de reserva", sube la imagen si hay una
// pendiente y devuelve { metodo, urlComprobante } al componente c8.
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
  private readonly imagenServicio = inject(ImagenServicio);
  private dialogRef: MatDialogRef<C11ProcesoPagoDialogo, PagoDialogoResultado> =
    inject(MatDialogRef);

  metodo = new FormControl('Yape', Validators.required);

  urlComprobante = new FormControl('', [
    Validators.required,
    Validators.pattern(/^https?:\/\/\S+$/),
    Validators.maxLength(500),
  ]);

  archivoPendiente = signal<File | null>(null);
  previewLocal = signal<string | null>(null);
  arrastrando = signal<boolean>(false);
  subiendo = signal<boolean>(false);
  estadoImagen = signal<{ tipo: 'info' | 'error'; texto: string } | null>(null);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando.set(false);
    const archivo = event.dataTransfer?.files?.[0];
    if (archivo) {
      this.prepararArchivo(archivo);
    }
  }

  alSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) {
      this.prepararArchivo(archivo);
    }
    input.value = '';
  }

  cancelarSeleccion(event: Event): void {
    event.stopPropagation();
    this.archivoPendiente.set(null);
    this.previewLocal.set(null);
    this.estadoImagen.set(null);
  }

  private prepararArchivo(archivo: File): void {
    if (!archivo.type.startsWith('image/')) {
      this.estadoImagen.set({ tipo: 'error', texto: 'Solo se permiten imágenes (JPG, PNG, WEBP).' });
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.estadoImagen.set({ tipo: 'error', texto: 'La imagen supera los 5 MB permitidos.' });
      return;
    }

    this.archivoPendiente.set(archivo);
    const reader = new FileReader();
    reader.onload = () => this.previewLocal.set(reader.result as string);
    reader.readAsDataURL(archivo);

    this.estadoImagen.set({
      tipo: 'info',
      texto: `Comprobante "${archivo.name}" listo. Se subirá al enviar la solicitud.`
    });
  }

  enviar(): void {
    if (this.metodo.invalid || this.subiendo()) {
      this.metodo.markAsTouched();
      return;
    }

    const pendiente = this.archivoPendiente();
    if (pendiente) {
      this.subiendo.set(true);
      this.estadoImagen.set(null);

      this.imagenServicio.subirImagen(pendiente).subscribe({
        next: (urlNube) => {
          this.subiendo.set(false);
          this.dialogRef.close({
            metodo: this.metodo.value!,
            urlComprobante: urlNube,
          });
        },
        error: () => {
          this.subiendo.set(false);
          this.estadoImagen.set({
            tipo: 'error',
            texto: 'No se pudo subir el comprobante a Cloudinary. Intenta de nuevo o pega una URL.'
          });
        }
      });
      return;
    }

    if (this.urlComprobante.invalid) {
      this.urlComprobante.markAsTouched();
      return;
    }

    this.dialogRef.close({
      metodo: this.metodo.value!,
      urlComprobante: this.urlComprobante.value!.trim(),
    });
  }
}
