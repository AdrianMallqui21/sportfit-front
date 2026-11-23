import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { UsuarioModelo } from '../../../modelos/usuario-modelo';
import { AdministradorServicio } from '../../../servicios/administrador-servicio';
import { ImagenServicio } from '../../../servicios/imagen-servicio';

@Component({
  selector: 'app-a7-cambiar-foto-dialogo',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './a7-cambiar-foto-dialogo.html',
  styleUrl: './a7-cambiar-foto-dialogo.css'
})
export class A7CambiarFotoDialogo {
  private readonly adminServicio = inject(AdministradorServicio);
  private readonly imagenServicio = inject(ImagenServicio);
  private readonly dialogRef = inject(MatDialogRef<A7CambiarFotoDialogo>);

  archivoPendiente = signal<File | null>(null);
  previewLocal = signal<string | null>(null);
  arrastrando = signal<boolean>(false);
  subiendo = signal<boolean>(false);
  guardando = signal<boolean>(false);
  estadoMensaje = signal<{ tipo: 'info' | 'error'; texto: string } | null>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public usuario: UsuarioModelo) {}

  obtenerPreview(): string {
    return this.previewLocal() || this.usuario?.imgUsuario || '';
  }

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
    this.estadoMensaje.set(null);
  }

  private prepararArchivo(archivo: File): void {
    if (!archivo.type.startsWith('image/')) {
      this.estadoMensaje.set({ tipo: 'error', texto: 'Solo se permiten archivos de imagen (JPG, PNG, WEBP).' });
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.estadoMensaje.set({ tipo: 'error', texto: 'La imagen supera los 5 MB permitidos.' });
      return;
    }

    this.archivoPendiente.set(archivo);
    const reader = new FileReader();
    reader.onload = () => this.previewLocal.set(reader.result as string);
    reader.readAsDataURL(archivo);

    this.estadoMensaje.set({
      tipo: 'info',
      texto: `Foto "${archivo.name}" lista. Se subirá a Cloudinary al pulsar GUARDAR FOTO.`
    });
  }

  guardarFoto(): void {
    const archivo = this.archivoPendiente();
    if (!archivo || this.subiendo() || this.guardando()) return;

    this.subiendo.set(true);
    this.estadoMensaje.set(null);

    this.imagenServicio.subirImagen(archivo).subscribe({
      next: (urlNube) => {
        this.subiendo.set(false);
        this.guardando.set(true);

        const extra = this.usuario as any;
        const usuarioActualizado: UsuarioModelo = Object.assign(new UsuarioModelo(), this.usuario, {
          imgUsuario: urlNube,
          idRol: this.usuario.idRol ?? extra?.rol?.idRol ?? 2
        });

        this.adminServicio.actualizarAdministrador(usuarioActualizado).subscribe({
          next: (resp) => {
            this.guardando.set(false);
            this.imagenServicio.notificarFotoPerfil(urlNube);
            this.dialogRef.close({ ...usuarioActualizado, ...resp, imgUsuario: urlNube });
          },
          error: (err: unknown) => {
            this.guardando.set(false);
            const msg = (err instanceof HttpErrorResponse && err.error?.message)
              ? err.error.message
              : 'No se pudo actualizar la fotografía en el servidor.';
            this.estadoMensaje.set({ tipo: 'error', texto: msg });
          }
        });
      },
      error: () => {
        this.subiendo.set(false);
        this.estadoMensaje.set({
          tipo: 'error',
          texto: 'No se pudo subir la imagen a Cloudinary. Verifica tu conexión o el Upload Preset.'
        });
      }
    });
  }
}
