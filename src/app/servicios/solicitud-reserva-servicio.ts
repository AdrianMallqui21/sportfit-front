import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReservaModelo, SolicitudReservaModelo } from '../modelos/solicitud-reserva-modelo';
import { SedeModelo } from '../modelos/espacio-deportivo-modelo';

@Injectable({
  providedIn: 'root'
})
export class SolicitudReservaServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  listarSolicitudes(): Observable<ReservaModelo[]> {
    return this.http.get<ReservaModelo[]>(`${this.url}/reservas/solicitadas`);
  }

  consultarDetalle(idReserva: number): Observable<SolicitudReservaModelo> {
    return this.http.get<SolicitudReservaModelo>(`${this.url}/reserva/${idReserva}`);
  }

  actualizarEstado(idReserva: number, estado: 'confirmada' | 'rechazada'): Observable<ReservaModelo> {
    return this.http.put<ReservaModelo>(`${this.url}/reserva/estado/${idReserva}?estado=${estado}`, {});
  }

  listarSedes(): Observable<SedeModelo[]> {
    return this.http.get<SedeModelo[]>(`${this.url}/sedes`);
  }
}
