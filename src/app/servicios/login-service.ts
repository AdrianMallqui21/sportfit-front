import { inject, Injectable, isDevMode } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CredencialesDTOModelo } from '../modelos/credenciales-dto-modelo';
import { RespuestaDTOModelo } from '../modelos/respuesta-dto-modelo';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  constructor() {}

  login(credencialesDTO: CredencialesDTOModelo): Observable<RespuestaDTOModelo> {
    return this.http //dirección y correo y contraseña enviados
      .post<RespuestaDTOModelo>(this.url + '/authenticate', credencialesDTO, {
        observe: 'response',
      })
      .pipe( //recuperamos el jwt
        map((response) => {
          const bearerToken = response.headers.get('Authorization');
          //
          if (!bearerToken) {
            throw new Error('Token no encontrado en la respuesta del servidor');
          }

          const token = bearerToken.replace('Bearer ', '');

          //guardamos la información del token
          localStorage.setItem('token', token);

          if (isDevMode()) {
            console.group('[LoginService] Login exitoso');
            console.log('Usuario:', credencialesDTO.correo);
            console.log('Token almacenado:', token);
            console.groupEnd();
          }

          return response.body as RespuestaDTOModelo;
        }),
      );
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

