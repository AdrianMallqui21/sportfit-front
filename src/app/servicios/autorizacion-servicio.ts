import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { RespuestaLoginModelo } from '../modelos/respuesta-login-modelo';
import { Observable } from 'rxjs';

@Service()
export class AutorizacionServicio {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);
  constructor() {}

  iniciarSesion(correo: string, contrasena: string): Observable<RespuestaLoginModelo> {
    return this.httpClient.post<RespuestaLoginModelo>(this.url + '/authenticate', {
      correo: correo.trim(),
      password: contrasena,
    });
  }

  registrarCliente(datos: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    correo: string;
    contrasenaHash: string;
  }): Observable<RespuestaLoginModelo> {
    return this.httpClient.post<RespuestaLoginModelo>(this.url + '/auth/register', datos);
  }
}
