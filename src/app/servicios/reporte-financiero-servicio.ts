import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BannerPagoReporteModelo,
  DistribucionPagoModelo,
  IngresoDiarioModelo
} from '../modelos/reporte-financiero-modelo';

@Injectable({
  providedIn: 'root'
})
export class ReporteFinancieroServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  obtenerIngresosPorPeriodo(anio: number, mes?: number | null): Observable<IngresoDiarioModelo[]> {
    let params = new HttpParams().set('anio', anio.toString());
    if (mes !== undefined && mes !== null && mes > 0) {
      params = params.set('mes', mes.toString());
    }
    return this.http.get<IngresoDiarioModelo[]>(`${this.url}/pago/reporte/ingresos`, { params });
  }

  obtenerDistribucionPorMetodoPago(anio: number, mes?: number | null): Observable<DistribucionPagoModelo[]> {
    let params = new HttpParams().set('anio', anio.toString());
    if (mes !== undefined && mes !== null && mes > 0) {
      params = params.set('mes', mes.toString());
    }
    return this.http.get<DistribucionPagoModelo[]>(`${this.url}/pago/reporte/metodos-pago`, { params });
  }

  cargarBannerPago(anio: number, mes?: number | null): Observable<BannerPagoReporteModelo> {
    let params = new HttpParams().set('anio', anio.toString());
    if (mes !== undefined && mes !== null && mes > 0) {
      params = params.set('mes', mes.toString());
    }
    return this.http.get<BannerPagoReporteModelo>(`${this.url}/pago/reporte/banner`, { params });
  }
}
