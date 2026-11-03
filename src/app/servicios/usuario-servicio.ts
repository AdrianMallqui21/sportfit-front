import { UsuarioModelo } from '../modelos/usuario-modelo';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Service()
export class UsuarioServicio {
  private url = environment.apiUrl;
  private httpClient: HttpClient = inject(HttpClient);
  obtenerPerfil(jwt: string) {
    return this.consultarPerfil(jwt, '/cliente/perfil');
  }

  obtenerPerfilAdministrador(jwt: string) {
    return this.consultarPerfil(jwt, '/administrador/perfil');
  }

  private consultarPerfil(jwt: string, ruta: string) {
    return this.httpClient.get<Omit<UsuarioModelo, 'jwt'>>(this.url + ruta, {
      headers: { Authorization: 'Bearer ' + jwt },
    });
  }
}
