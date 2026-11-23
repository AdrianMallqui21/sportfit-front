import {inject, Service} from '@angular/core';
import {Observable} from 'rxjs';
import {DetalleSedeModelo} from '../modelos/pago-modelo';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Service()
export class PagoServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);


  // ED20 · Dentro de PagoServicio
  listarDetalleSede(
    mes: number,
    anio: number,
    sedeId?: number
  ): Observable<DetalleSedeModelo[]> {
    return this.http.get<DetalleSedeModelo[]>(
      `${this.url}/pagos-detalles/reserva/sede`,
      {params: sedeId === undefined ? {mes, anio} : {mes, anio, sedeId}}
    );
  }

}
