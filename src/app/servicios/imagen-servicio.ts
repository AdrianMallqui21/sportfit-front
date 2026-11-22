import { Injectable, inject, signal } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface CloudinaryRespuesta {
  secure_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImagenServicio {
  private readonly httpSinInterceptor = new HttpClient(inject(HttpBackend));

  /** Signal reactivo para refrescar las barras laterales apenas cambia la foto de perfil. */
  readonly fotoPerfilActualizada = signal<string | null>(null);

  /**
   * Sube una imagen directamente a Cloudinary (Unsigned Upload) y devuelve su secure_url.
   */
  subirImagen(archivo: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', archivo);
    formData.append('upload_preset', environment.cloudinaryUploadPreset);

    const url = `https://api.cloudinary.com/v1_1/${environment.cloudinaryCloudName}/image/upload`;
    return this.httpSinInterceptor.post<CloudinaryRespuesta>(url, formData).pipe(
      map(resp => resp.secure_url)
    );
  }

  notificarFotoPerfil(url: string): void {
    this.fotoPerfilActualizada.set(url);
  }
}
