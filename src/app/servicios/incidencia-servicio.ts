import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IncidenciaModelo, IncidenciaRegistroModelo } from '../modelos/incidencia-modelo';

@Injectable({
  providedIn: 'root',
})

export class IncidenciaServicio {
  private url = environment.apiUrl;
  private httpClient = inject(HttpClient);

  constructor() {}

  // ED34 - Registrar incidencia
  registrarIncidencia(incidencia: IncidenciaRegistroModelo): Observable<IncidenciaModelo> {
    return this.httpClient.post<IncidenciaModelo>(this.url + '/incidencia', incidencia);
  }

  // ED27 - Historial de incidencias del cliente
  listarPorUsuario(idUsuario: number): Observable<IncidenciaModelo[]> {
    return this.httpClient.get<IncidenciaModelo[]>(this.url + '/incidencia/usuario/' + idUsuario);
  }
}
