import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { SedeCanchaModelo, TipoCanchaModelo } from '../../../modelos/espacio-deportivo-modelo';
import { EspacioDeportivoServicio } from '../../../servicios/espacio-deportivo-servicio';
import { ImagenServicio } from '../../../servicios/imagen-servicio';

export interface OpcionDeporteEspacio {
  valor: string;
  etiqueta: string;
}

export interface DatosEditarEspacioDialogo {
  cancha: SedeCanchaModelo;
  opcionesDeporte: OpcionDeporteEspacio[];
  opcionesAforo: number[];
  tiposCancha?: TipoCanchaModelo[];
}

@Component({
  selector: 'app-a23-editar-espacio-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './a23-editar-espacio-dialogo.html',
  styleUrl: './a23-editar-espacio-dialogo.css'
})
export class A23EditarEspacioDialogo {
  private readonly fb = inject(FormBuilder);
  private readonly espacioServicio = inject(EspacioDeportivoServicio);
  private readonly imagenServicio = inject(ImagenServicio);
  private readonly dialogRef = inject(MatDialogRef<A23EditarEspacioDialogo>);

  formEdicion: FormGroup;
  guardando = signal<boolean>(false);
  subiendoImagen = signal<boolean>(false);
  arrastrando = signal<boolean>(false);
  errorServidor = signal<string | null>(null);
  archivoPendiente = signal<File | null>(null);
  previewLocal = signal<string | null>(null);
  estadoImagen = signal<{ tipo: 'ok' | 'info' | 'error'; texto: string } | null>(null);
  imagenInvalida = signal<boolean>(false);

  readonly opcionesDeporte: OpcionDeporteEspacio[];
  readonly opcionesAforo: number[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: DatosEditarEspacioDialogo) {
    this.opcionesDeporte = (data.opcionesDeporte || []).filter(o => o.valor !== '');
    this.opcionesAforo = data.opcionesAforo || [4, 8, 10, 12, 14, 16, 18, 22];

    const c = data.cancha;
    const depActual = (c.cancha?.deporte || 'FUTBOL').toUpperCase();
    const deporteForm = depActual === 'BASQUET' ? 'BASKET' : depActual;

    this.formEdicion = this.fb.group({
      nombre: [c.nombre || '', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      deporte: [deporteForm, Validators.required],
      aforo: [c.cancha?.aforo || 10, [Validators.required, Validators.min(2)]],
      precio: [c.precio ? Number(c.precio) : 60, [Validators.required, Validators.min(10), Validators.max(2000)]],
      imgCancha: [c.imgCancha || '', [Validators.maxLength(300)]]
    });
  }

  obtenerUrlPreview(): string {
    if (this.previewLocal()) return this.previewLocal()!;
    return (this.formEdicion.get('imgCancha')?.value || '').trim();
  }

  alCambiarUrlImagen(): void {
    this.archivoPendiente.set(null);
    this.previewLocal.set(null);
    this.estadoImagen.set(null);
    this.imagenInvalida.set(false);
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
      this.prepararArchivoLocal(archivo);
    }
  }

  alSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (archivo) {
      this.prepararArchivoLocal(archivo);
    }
    input.value = '';
  }

  cancelarSeleccionImagen(event: Event): void {
    event.stopPropagation();
    this.archivoPendiente.set(null);
    this.previewLocal.set(null);
    this.estadoImagen.set(null);
    this.imagenInvalida.set(false);
  }

  private prepararArchivoLocal(archivo: File): void {
    if (!archivo.type.startsWith('image/')) {
      this.estadoImagen.set({ tipo: 'error', texto: 'Solo se permiten archivos de imagen (JPG, PNG, WEBP).' });
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.estadoImagen.set({ tipo: 'error', texto: 'La imagen supera los 5 MB permitidos.' });
      return;
    }

    this.archivoPendiente.set(archivo);
    this.imagenInvalida.set(false);

    const reader = new FileReader();
    reader.onload = () => this.previewLocal.set(reader.result as string);
    reader.readAsDataURL(archivo);

    this.estadoImagen.set({
      tipo: 'info',
      texto: `Imagen "${archivo.name}" lista. Se subirá a Cloudinary al pulsar ACTUALIZAR.`
    });
  }

  guardarEdicion(): void {
    if (this.formEdicion.invalid || this.guardando() || this.subiendoImagen()) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    const pendiente = this.archivoPendiente();
    if (pendiente) {
      this.subiendoImagen.set(true);
      this.errorServidor.set(null);

      this.imagenServicio.subirImagen(pendiente).subscribe({
        next: (urlNube) => {
          this.subiendoImagen.set(false);
          this.archivoPendiente.set(null);
          this.previewLocal.set(null);
          this.formEdicion.patchValue({ imgCancha: urlNube });
          this.enviarActualizacionBackend(urlNube);
        },
        error: () => {
          this.subiendoImagen.set(false);
          this.estadoImagen.set({
            tipo: 'error',
            texto: 'No se pudo subir la imagen a Cloudinary. Verifica tu conexión o el Upload Preset.'
          });
        }
      });
    } else {
      const urlActual = (this.formEdicion.get('imgCancha')?.value || '').trim();
      this.enviarActualizacionBackend(urlActual);
    }
  }

  private enviarActualizacionBackend(urlImagen: string): void {
    const cancha = this.data.cancha;
    const formVal = this.formEdicion.getRawValue();
    const depNorm = this.normalizarTexto(formVal.deporte || '');

    const tipoMatch = (this.data.tiposCancha || []).find(
      t => this.normalizarTexto(t.deporte || '') === depNorm
    );

    const mapaTipoCancha: Record<string, number> = {
      FUTBOL: 1,
      BASKET: 2,
      BASQUET: 2,
      VOLEY: 3,
      TENIS: 4,
      FUTSAL: 5
    };

    const idTipo = tipoMatch?.idTipoCancha || mapaTipoCancha[depNorm] || cancha.idTipoCancha || cancha.cancha?.idTipoCancha || 1;
    const idSede = cancha.idSedeSede || cancha.sede?.idSede || 1;
    const imgFinal = urlImagen || cancha.imgCancha || 'https://sportfit.com/imagenes/cancha-default.png';

    const dtoActualizado: SedeCanchaModelo = {
      ...cancha,
      nombre: formVal.nombre.trim(),
      precio: Number(formVal.precio),
      estado: cancha.estado,
      imgCancha: imgFinal,
      idSedeSede: idSede,
      idTipoCancha: idTipo,
      sede: {
        idSede,
        nombre: cancha.sede?.nombre || 'Sede'
      },
      cancha: {
        idTipoCancha: idTipo,
        deporte: formVal.deporte.toUpperCase(),
        descripcion: tipoMatch?.descripcion || cancha.cancha?.descripcion || 'Cancha deportiva con iluminación LED',
        aforo: Number(formVal.aforo)
      }
    };

    this.guardando.set(true);
    this.errorServidor.set(null);

    this.espacioServicio.update(dtoActualizado).subscribe({
      next: (resp) => {
        this.guardando.set(false);
        this.dialogRef.close(resp);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'Error al comunicarse con el backend para actualizar el espacio.';
        this.errorServidor.set(msg);
      }
    });
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }
}
