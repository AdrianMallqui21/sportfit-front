import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReporteReservaCliente {
  clienteId: string;
  nombreCliente: string;
  ultimaReserva: string | null;
  totalReservas: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReporteReservaClienteServicio {
  private httpClient = inject(HttpClient);
  private url = environment.apiUrl;

  obtenerReporte(fechaDesde: string, fechaHasta: string, minReservas: number | null, maxReservas: number | null, top: number | null,
  ): Observable<ReporteReservaCliente[]> {
    let params = new HttpParams();

    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }

    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }

    if (minReservas !== null) {
      params = params.set('minReservas', minReservas);
    }

    if (maxReservas !== null) {
      params = params.set('maxReservas', maxReservas);
    }

    if (top !== null && top > 0) {
      params = params.set('top', top);
    }

    return this.httpClient.get<ReporteReservaCliente[]>(
      this.url + '/reportes/reservas-por-cliente',
      { params },
    );
  }
}
