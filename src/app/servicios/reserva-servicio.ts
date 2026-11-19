import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BannerReservasModelo,
  ReservaHorarioModelo,
  ReservaModelo,
  SolicitudReservaModelo
} from '../modelos/solicitud-reserva-modelo';
import { SedeCanchaModelo, SedeModelo, TipoCanchaModelo } from '../modelos/espacio-deportivo-modelo';

@Injectable({
  providedIn: 'root'
})
export class ReservaServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  // ED16: Listar todas las reservas
  listarReservas(): Observable<ReservaModelo[]> {
    return this.http.get<ReservaModelo[]>(`${this.url}/reservas`);
  }

  // ED14: Cargar métricas del banner de reservas
  cargarBannerReservas(): Observable<BannerReservasModelo> {
    return this.http.get<BannerReservasModelo>(`${this.url}/reservas-banners`);
  }

  // ED01: Consultar detalle de reserva
  consultarReserva(idReserva: number): Observable<SolicitudReservaModelo> {
    return this.http.get<SolicitudReservaModelo>(`${this.url}/reserva/${idReserva}`);
  }

  // ED61: Filtrar reservas por estado, sede, tipo de cancha y fecha
  filtrarReservas(
    estado?: string | null,
    idSede?: number | null,
    idTipoCancha?: number | null,
    fecha?: string | null
  ): Observable<ReservaModelo[]> {
    let params = new HttpParams();
    if (estado && estado.trim().length > 0) {
      params = params.set('estado', estado.trim().toLowerCase());
    }
    if (idSede !== null && idSede !== undefined && idSede > 0) {
      params = params.set('idSede', idSede.toString());
    }
    if (idTipoCancha !== null && idTipoCancha !== undefined && idTipoCancha > 0) {
      params = params.set('idTipoCancha', idTipoCancha.toString());
    }
    if (fecha && fecha.trim().length > 0) {
      params = params.set('fecha', fecha.trim());
    }
    return this.http.get<ReservaModelo[]>(`${this.url}/reserva-filtro-concatenado`, { params });
  }

  // ED17: Consultar horarios por fecha, deporte y sede
  listarHorarios(fecha: string, idDeporte: number, idSede: number): Observable<ReservaHorarioModelo[]> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('idDeporte', idDeporte.toString())
      .set('idSede', idSede.toString());
    return this.http.get<ReservaHorarioModelo[]>(`${this.url}/reservas/horarios`, { params });
  }

  // ED23: Editar / actualizar reserva
  editarReserva(reserva: Partial<ReservaModelo>): Observable<ReservaModelo> {
    return this.http.put<ReservaModelo>(`${this.url}/reserva-actualizar`, reserva);
  }

  // ED24: Cancelación / baja lógica de reserva
  cancelarReserva(idReserva: number): Observable<ReservaModelo> {
    return this.http.put<ReservaModelo>(`${this.url}/reserva-cancelar/${idReserva}`, {});
  }

  // Catálogos auxiliares para filtros y modal de edición
  listarSedes(): Observable<SedeModelo[]> {
    return this.http.get<SedeModelo[]>(`${this.url}/sedes`);
  }

  listarTiposCancha(): Observable<TipoCanchaModelo[]> {
    return this.http.get<TipoCanchaModelo[]>(`${this.url}/tipoCanchas`);
  }

  listarCanchas(): Observable<SedeCanchaModelo[]> {
    return this.http.get<SedeCanchaModelo[]>(`${this.url}/canchas`);
  }
}
