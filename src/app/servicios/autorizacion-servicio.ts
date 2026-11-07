import {inject, isDevMode, Service} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {CredencialesDTOModelo} from '../modelos/credenciales-dto-modelo';
import {RespuestaDTOModelo} from '../modelos/respuesta-dto-modelo';

@Service()
export class AutorizacionServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  constructor() {
  }

  accederCliente(credencialesDTO: CredencialesDTOModelo): Observable<RespuestaDTOModelo> {
    return this.http.post<RespuestaDTOModelo>(this.url + '/authenticate', credencialesDTO, {observe: 'response'})
      .pipe(
        map(response => {
          const bearerToken = response.headers.get('Authorization');

          if (!bearerToken) {
            throw new Error('Token no encontrado en la respuesta del servidor');
          }

          const token = bearerToken.replace('Bearer ', '');
          localStorage.setItem('token', token);

          if (isDevMode()) {
            console.group('[AuthService] login exitoso');
            console.log('Usuario:', credencialesDTO.correo);
            console.log('Token almacenado:', token);
            console.groupEnd();
          }

          return response.body as RespuestaDTOModelo;

        })
      )
  }


}
