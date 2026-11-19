import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReservaHome, SedeCanchaHome, SedeHome, TipoCanchaHome, } from '../modelos/home-cliente-modelo';
import {UsuarioModelo} from '../modelos/usuario-modelo'; //reciclando algo general

@Injectable({
  providedIn: 'root',
})
export class ClienteServicio {
  private url = environment.apiUrl;
  private httpClient = inject(HttpClient);

  constructor() {}

  // Obtener usuario autenticado: cliente o administrador
  obtenerUsuario(correo: string, idRol: number): Observable<UsuarioModelo> {
    return this.httpClient.get<UsuarioModelo>(
      this.url + '/obtener-usuario?correo=' + encodeURIComponent(correo) + '&idRol=' + idRol,
    );
  }

  // ED55 Actualizar usuario
  actualizarPerfil(usuario: UsuarioModelo): Observable<UsuarioModelo> {
    return this.httpClient.put<UsuarioModelo>(
      this.url + '/usuario-actualizar', usuario,
    );
  }

  // ED02 - Obtener reservas del cliente
  obtenerReservas(idUsuario: number): Observable<ReservaHome[]> {
    return this.httpClient.get<ReservaHome[]>(
      this.url + '/reserva/usuario/' + idUsuario,
    );
  }

  // ED11 - Obtener próximas reservas
  obtenerProximas(idUsuario: number): Observable<ReservaHome[]> {
    return this.httpClient.get<ReservaHome[]>(
      this.url + '/reservas-proximas/usuario/' + idUsuario,
    );
  }

  // ED12 - Obtener solicitudes de reserva
  obtenerSolicitadas(idUsuario: number): Observable<ReservaHome[]> {
    return this.httpClient.get<ReservaHome[]>(
      this.url + '/reservas-solicitadas/usuario/' + idUsuario,
    );
  }

  // Obtener canchas no establecido como endpoint en el backend están desactivadas muy mal la verdad
  obtenerCanchas(): Observable<SedeCanchaHome[]> {
    return this.httpClient.get<SedeCanchaHome[]>(this.url + '/canchas',);
  }

  // Obtener sedes
  obtenerSedes(): Observable<SedeHome[]> {
    return this.httpClient.get<SedeHome[]>(this.url + '/sedes',);
  }

  // Obtener tipos de cancha
  obtenerTiposCancha(): Observable<TipoCanchaHome[]> {
    return this.httpClient.get<TipoCanchaHome[]>(this.url + '/tipoCanchas',);
  }
}
