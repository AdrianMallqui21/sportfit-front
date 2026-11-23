import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  MontoPerdidoModelo,
  MotivoCancelacionModelo,
  TendenciaCancelacionModelo,
  TotalCancelacionesModelo,
} from '../modelos/reporte-cancelacion-modelo';


@Service()
export class ReporteCancelacionServicio {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);

  constructor() {}

  // ED07: total de reservas canceladas en un mes y año
  obtenerTotal(mes: number, anio: number): Observable<TotalCancelacionesModelo> {
    console.log('Consultando total de cancelaciones:', mes, anio);
    const params = new HttpParams().set('mes', mes).set('anio', anio);
    return this.httpClient.get<TotalCancelacionesModelo>(this.url + '/reservas-canceladas/total', {
      params,
    });
  }

  // ED18: cancelaciones agrupadas por motivo en un mes y año (ya vienen de mayor a menor)
  obtenerMotivos(mes: number, anio: number): Observable<MotivoCancelacionModelo[]> {
    console.log('Consultando distribución por motivo:', mes, anio);
    const params = new HttpParams().set('mes', mes).set('anio', anio);
    return this.httpClient.get<MotivoCancelacionModelo[]>(
      this.url + '/reservas-canceladas/motivos',
      { params },
    );
  }

  // ED19: cancelaciones de todo un año, por mes y por motivo
  obtenerTendenciaAnual(anio: number): Observable<TendenciaCancelacionModelo[]> {
    console.log('Consultando tendencia anual:', anio);
    const params = new HttpParams().set('anio', anio);
    return this.httpClient.get<TendenciaCancelacionModelo[]>(
      this.url + '/reservas-canceladas/tendencia-anual',
      { params },
    );
  }

  // ED06: monto perdido por las cancelaciones de un mes y año
  obtenerMontoPerdido(mes: number, anio: number): Observable<MontoPerdidoModelo> {
    console.log('Consultando monto perdido:', mes, anio);
    const params = new HttpParams().set('mes', mes).set('anio', anio);
    return this.httpClient.get<MontoPerdidoModelo>(
      this.url + '/reservas-canceladas/monto-perdido',
      { params },
    );
  }
}
