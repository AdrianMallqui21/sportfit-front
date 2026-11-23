import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BannerIncidenciasModelo,
  DistribucionCategoriaModelo,
  EstadoResolucionModelo,
  IncidenciaModelo,
  IncidenciaRegistroModelo,
  SedeIncidenciaModelo,
  TendenciaIncidenciasModelo
} from '../modelos/incidencia-modelo';
import { SedeModelo } from '../modelos/espacio-deportivo-modelo';

@Injectable({
  providedIn: 'root'
})
export class IncidenciaServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  obtenerBanner(anio: number, mes: number): Observable<BannerIncidenciasModelo> {
    const params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());
    return this.http.get<BannerIncidenciasModelo>(`${this.url}/incidencias/banner`, { params });
  }

  obtenerEstadoResolucion(anio: number, mes: number): Observable<EstadoResolucionModelo> {
    const params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());
    return this.http.get<EstadoResolucionModelo>(`${this.url}/incidencias/grafico-estado-resolucion`, { params });
  }

  obtenerTendencia(anio: number): Observable<TendenciaIncidenciasModelo[]> {
    const params = new HttpParams().set('anio', anio.toString());
    return this.http.get<TendenciaIncidenciasModelo[]>(`${this.url}/incidencias/grafico-tendencia-mensual`, { params });
  }

  obtenerTendenciaMensual(anio: number): Observable<TendenciaIncidenciasModelo[]> {
    return this.obtenerTendencia(anio);
  }

  obtenerDistribucionCategorias(anio: number, mes: number): Observable<DistribucionCategoriaModelo[]> {
    const params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());
    return this.http.get<DistribucionCategoriaModelo[]>(`${this.url}/incidencias/grafico-distribucion-categoria`, { params });
  }

  obtenerPorSedes(anio: number, mes: number, idSede?: number): Observable<SedeIncidenciaModelo[]> {
    let params = new HttpParams()
      .set('anio', anio.toString())
      .set('mes', mes.toString());
    if (idSede !== undefined && idSede !== null && idSede > 0) {
      params = params.set('idSede', idSede.toString());
    }
    return this.http.get<SedeIncidenciaModelo[]>(`${this.url}/incidencias/por-sede`, { params });
  }

  listarSedes(): Observable<SedeModelo[]> {
    return this.http.get<SedeModelo[]>(`${this.url}/sedes`);
  }

  filtrarIncidencias(tipo: string, estado: string, fecha?: string): Observable<IncidenciaModelo[]> {
    let params = new HttpParams();

    if (tipo) params = params.set('tipo', tipo);
    if (estado) params = params.set('estado', estado);
    if (fecha) params = params.set('fecha', fecha);

    return this.http.get<IncidenciaModelo[]>(`${this.url}/incidencias/filtro`, { params });
  }

  buscarIncidenciaPorId(id: number): Observable<IncidenciaModelo> {
    return this.http.get<IncidenciaModelo>(`${this.url}/incidencia-id/${id}`);
  }

  responderIncidencia(idIncidencia: number, respuestaAdmin: string): Observable<IncidenciaModelo> {
    return this.http.put<IncidenciaModelo>(`${this.url}/incidencia-responder`, {
      idIncidencia,
      respuestaAdmin,
    });
  }

  listarIncidencias(): Observable<IncidenciaModelo[]> {
    return this.http.get<IncidenciaModelo[]>(`${this.url}/incidencias`);
  }

  // ED34 - Registrar incidencia
  registrarIncidencia(incidencia: IncidenciaRegistroModelo): Observable<IncidenciaModelo> {
    return this.http.post<IncidenciaModelo>(this.url + '/incidencia', incidencia);
  }

  // ED27 - Historial de incidencias del cliente
  listarPorUsuario(idUsuario: number): Observable<IncidenciaModelo[]> {
    return this.http.get<IncidenciaModelo[]>(this.url + '/incidencia/usuario/' + idUsuario);
  }
}
