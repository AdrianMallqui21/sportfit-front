import { inject, Service } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReservaHome } from '../modelos/home-cliente-modelo';
import {
  CancelacionSolicitud,
  CanchaReserva,
  FiltroMisReservas,
  HorarioOcupado,
  MiReserva,
  SedeReserva,
  SolicitudReserva,
  TipoCanchaReserva,
} from '../modelos/reserva-modelo';

@Service()
export class ReservaServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  // Arma la cabecera con el token que se guardó al iniciar sesión.
  // Sin esta cabecera el back responde 401.
  private opciones() {
    const token = localStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: 'Bearer ' + token }) };
  }

  // Trae todas las sedes para llenar el combo "Sede".
  listarSedes(): Observable<SedeReserva[]> {
    return this.http.get<SedeReserva[]>(this.url + '/sedes', this.opciones());
  }

  // Trae los tipos de cancha para llenar el combo "Deporte".
  // También sirve para el diálogo "Ver detalles" (descripción y aforo).
  listarTiposCancha(): Observable<TipoCanchaReserva[]> {
    return this.http.get<TipoCanchaReserva[]>(this.url + '/tipoCanchas', this.opciones());
  }

  // Trae las canchas de una sede para un deporte: son las filas del cuadro.
  listarCanchas(idSede: number, idTipoCancha: number): Observable<CanchaReserva[]> {
    return this.http.get<CanchaReserva[]>(
      this.url + '/cancha/sede/' + idSede + '/deporte/' + idTipoCancha,
      this.opciones(),
    );
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
      ...this.opciones(),
      params: { fecha, idDeporte: idTipoCancha, idSede },
    });
  }

  // Envía la solicitud: crea la reserva (estado 'solicitada') y su pago en una sola llamada.
  // Si el horario ya fue tomado, el back responde 409 y el componente muestra el aviso.
  solicitarReserva(solicitud: SolicitudReserva): Observable<ReservaHome> {
    console.log('[ReservaServicio] Enviando solicitud de reserva:', solicitud);
    return this.http.post<ReservaHome>(this.url + '/reserva/solicitar', solicitud, this.opciones());
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
      ...this.opciones(),
      params,
    });
  }

  // Cancela una reserva confirmada: registra la cancelación y el back cambia el estado a 'cancelada'
  // y notifica al cliente y al administrador de la sede.
  cancelarReserva(cancelacion: CancelacionSolicitud): Observable<unknown> {
    console.log('[ReservaServicio] Cancelando la reserva', cancelacion.idReserva);
    return this.http.post(this.url + '/cancelacion', cancelacion, this.opciones());
  }
}
