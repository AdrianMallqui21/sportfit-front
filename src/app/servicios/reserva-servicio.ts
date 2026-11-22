import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {
  BannerReservasModelo,
  ReservaHorarioModelo,
  ReservaModelo,
  SolicitudReservaModelo
} from '../modelos/solicitud-reserva-modelo';
import {SedeCanchaModelo, SedeModelo, TipoCanchaModelo} from '../modelos/espacio-deportivo-modelo';
import { ReservaHome } from '../modelos/home-cliente-modelo';
import {
  CancelacionSolicitud,
  CanchaReserva,
  DeporteParticipacionModelo,
  FiltroMisReservas,
  HorarioOcupado,
  MiReserva,
  ReservaDeporteSedeModelo,
  SedeReserva,
  SolicitudReserva,
  TendenciaAnualModelo,
  TipoCanchaReserva,
} from '../modelos/reserva-modelo';

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
    return this.http.get<ReservaModelo[]>(`${this.url}/reserva-filtro-concatenado`, {params});
  }

  // ED17: Consultar horarios por fecha, deporte y sede
  listarHorarios(fecha: string, idDeporte: number, idSede: number): Observable<ReservaHorarioModelo[]> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('idDeporte', idDeporte.toString())
      .set('idSede', idSede.toString());
    return this.http.get<ReservaHorarioModelo[]>(`${this.url}/reservas/horarios`, {params});
  }

  // ED23: Editar / actualizar reserva
  editarReserva(reserva: Partial<ReservaModelo>): Observable<ReservaModelo> {
    return this.http.put<ReservaModelo>(`${this.url}/reserva-actualizar`, reserva);
  }

  cancelarReserva(idReserva: number): Observable<ReservaModelo>;
  cancelarReserva(cancelacion: CancelacionSolicitud): Observable<unknown>;
  cancelarReserva(reserva: number | CancelacionSolicitud): Observable<unknown> {
    if (typeof reserva === 'number') {
      return this.http.put<ReservaModelo>(`${this.url}/reserva-cancelar/${reserva}`, {});
    }
    return this.http.post(`${this.url}/cancelacion`, reserva);
  }

  // Catálogos auxiliares para filtros y modal de edición
  listarSedes(): Observable<(SedeModelo & SedeReserva)[]> {
    return this.http.get<(SedeModelo & SedeReserva)[]>(`${this.url}/sedes`);
  }

  listarTiposCancha(): Observable<(TipoCanchaModelo & TipoCanchaReserva)[]> {
    return this.http.get<(TipoCanchaModelo & TipoCanchaReserva)[]>(`${this.url}/tipoCanchas`);
  }

  listarCanchas(): Observable<SedeCanchaModelo[]>;
  listarCanchas(idSede: number, idTipoCancha: number): Observable<CanchaReserva[]>;
  listarCanchas(
    idSede?: number,
    idTipoCancha?: number,
  ): Observable<SedeCanchaModelo[] | CanchaReserva[]> {
    if (idSede !== undefined && idTipoCancha !== undefined) {
      return this.http.get<CanchaReserva[]>(`${this.url}/cancha/sede/${idSede}/deporte/${idTipoCancha}`);
    }
    return this.http.get<SedeCanchaModelo[]>(`${this.url}/canchas`);
  }

  // ED03
  frecuenciaReservasPorDeporteSede(mes?: number): Observable<ReservaDeporteSedeModelo[]> {
    return this.http.get<Array<Partial<ReservaDeporteSedeModelo> & {
      Deporte?: string;
      Sede?: string;
      frecuencia: number;
    }>>(
      `${this.url}/reservas/sede/tipoCancha`,
      { params: mes === undefined ? {} : { mes } }
    ).pipe(map(filas => filas.map(fila => ({
      deporte: fila.deporte ?? fila.Deporte ?? 'Sin deporte',
      sede: fila.sede ?? fila.Sede ?? 'Sin sede',
      frecuencia: fila.frecuencia,
    }))));
  }

  // ED04
  listarDeporteParticipacion(): Observable<DeporteParticipacionModelo[]> {
    return this.http.get<DeporteParticipacionModelo[]>(`${this.url}/reservas/sede/tipoCancha/participacion`);
  }

  // ED13
  listarTendenciaAnual(anio?: number): Observable<TendenciaAnualModelo[]> {
    return this.http.get<TendenciaAnualModelo[]>(`${this.url}/reservas-tendencia-anual`, {params: anio === undefined ? {} : {anio}});
  }

  // Trae los horarios ya ocupados (solicitados o confirmados) de una fecha: las celdas rojas.
  // fecha va en formato 'yyyy-MM-dd'. El back llama "idDeporte" al id del tipo de cancha.
  listarHorariosOcupados(
    fecha: string,
    idTipoCancha: number,
    idSede: number,
  ): Observable<HorarioOcupado[]> {
    console.log('[ReservaServicio] Consultando horarios ocupados:', {
      fecha,
      idTipoCancha,
      idSede,
    });
    return this.http.get<HorarioOcupado[]>(this.url + '/reservas/horarios', {
      params: { fecha, idDeporte: idTipoCancha, idSede },
    });
  }

  // Envía la solicitud: crea la reserva (estado 'solicitada') y su pago en una sola llamada.
  // Si el horario ya fue tomado, el back responde 409 y el componente muestra el aviso.
  solicitarReserva(solicitud: SolicitudReserva): Observable<ReservaHome> {
    console.log('[ReservaServicio] Enviando solicitud de reserva:', solicitud);
    return this.http.post<ReservaHome>(this.url + '/reserva/solicitar', solicitud);
  }

  // Trae las reservas de un cliente. Solo se envían los filtros que tengan valor (filtros concatenados).
  listarMisReservas(idUsuario: number, filtros: FiltroMisReservas): Observable<MiReserva[]> {
    // Se quitan los filtros vacíos para que no viajen como parámetros
    const params: Record<string, string | number> = {};
    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') params[clave] = valor;
    });
    console.log('[ReservaServicio] Consultando mis reservas:', params);
    return this.http.get<MiReserva[]>(this.url + '/reservas-filtro/usuario/' + idUsuario, {
      params,
    });
  }
}
