import {HttpClient} from '@angular/common/http';
import {inject, Service} from '@angular/core';
import {environment} from '../../environments/environment';

export interface Notificacion {
  idNotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  fNotificacion: string;
  leido: boolean;
}

@Service()
export class NotificacionServicio {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  listarPorUsuario(idUsuario: number) {
    return this.http.get<Notificacion[]>(`${this.api}/notificacion/cliente/${idUsuario}`);
  }

  marcarComoLeida(idNotificacion: number) {
    return this.http.put<void>(`${this.api}/notificacion-leida/${idNotificacion}`, {});
  }

  eliminar(idNotificacion: number) {
    return this.http.delete<void>(`${this.api}/notificacion-eliminar/${idNotificacion}`);
  }
}
