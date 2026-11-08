import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SedeCanchaModelo, SedeModelo, TipoCanchaModelo } from '../modelos/espacio-deportivo-modelo';
import { ReservaModelo } from '../modelos/solicitud-reserva-modelo';

@Injectable({
  providedIn: 'root'
})
export class EspacioDeportivoServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  listarCanchas(): Observable<SedeCanchaModelo[]> {
    return this.http.get<SedeCanchaModelo[]>(`${this.url}/canchas`);
  }

  list(): Observable<SedeCanchaModelo[]> {
    return this.listarCanchas();
  }

  filtrarCanchas(estado?: boolean | null, idSede?: number | null, deporte?: string | null): Observable<SedeCanchaModelo[]> {
    let params = new HttpParams();
    if (estado !== null && estado !== undefined) {
      params = params.set('estado', estado.toString());
    }
    if (idSede !== null && idSede !== undefined) {
      params = params.set('idSede', idSede.toString());
    }
    if (deporte && deporte.trim().length > 0) {
      params = params.set('deporte', deporte.trim());
    }
    return this.http.get<SedeCanchaModelo[]>(`${this.url}/canchas/filtros`, { params });
  }

  cambiarEstado(idCancha: number, estado: boolean): Observable<SedeCanchaModelo> {
    return this.http.put<SedeCanchaModelo>(`${this.url}/sede-cancha/${idCancha}/estado?estado=${estado}`, {});
  }

  actualizarEspacio(id: number, dto: SedeCanchaModelo): Observable<SedeCanchaModelo> {
    return this.http.put<SedeCanchaModelo>(`${this.url}/cancha/espacio/${id}`, dto);
  }

  update(dto: SedeCanchaModelo): Observable<SedeCanchaModelo> {
    return this.actualizarEspacio(dto.idSedeCancha, dto);
  }

  listarReservasPorCancha(idCancha: number): Observable<ReservaModelo[]> {
    return this.http.get<ReservaModelo[]>(`${this.url}/reservas/cancha/${idCancha}`);
  }

  listarSedes(): Observable<SedeModelo[]> {
    return this.http.get<SedeModelo[]>(`${this.url}/sedes`);
  }

  listarTiposCancha(): Observable<TipoCanchaModelo[]> {
    return this.http.get<TipoCanchaModelo[]>(`${this.url}/tipo-canchas`);
  }
}
