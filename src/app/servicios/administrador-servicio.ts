import {inject, Service} from '@angular/core';
import {Observable} from 'rxjs';
import {UsuarioModelo} from '../modelos/usuario-modelo';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

@Service()
export class AdministradorServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  obtenerAdministradorCorreo(correo: string, idRol: number): Observable<UsuarioModelo> {
    return this.http.get<UsuarioModelo>(this.url + '/obtener-usuario', {params: {correo, idRol}});
  }

}
