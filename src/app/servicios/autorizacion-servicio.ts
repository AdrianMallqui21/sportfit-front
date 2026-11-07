import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Service()
export class AutorizacionServicio {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);
  constructor() {}

  registrarCliente(datos: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    correo: string;
    contrasenaHash: string;
  }): Observable<unknown> {
    return this.httpClient.post<unknown>(this.url + '/auth/register', datos);
  }
}
