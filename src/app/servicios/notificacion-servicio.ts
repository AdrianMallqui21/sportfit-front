import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificacionModelo } from '../modelos/notificacion-modelo';

@Injectable({ providedIn: 'root' })
export class NotificacionServicio {
  private url = environment.apiUrl;
  private httpClient = inject(HttpClient);

  listarPorUsuario(idUsuario: number): Observable<NotificacionModelo[]> {
    return this.httpClient.get<NotificacionModelo[]>(
      this.url + '/notificacion/cliente/' + idUsuario,
    );
  }

  marcarComoLeida(id: number): Observable<NotificacionModelo> {
    return this.httpClient.put<NotificacionModelo>(this.url + '/notificacion-leida/' + id, {});
  }

  eliminar(id: number): Observable<void> {
    return this.httpClient.delete<void>(this.url + '/notificacion-eliminar/' + id);
  }
}
