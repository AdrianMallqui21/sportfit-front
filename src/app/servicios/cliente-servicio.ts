import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {ClienteModelo} from '../modelos/cliente-modelo';
import {ReservaModelo} from '../modelos/solicitud-reserva-modelo';
import { UsuarioModelo } from '../modelos/usuario-modelo';
import {
  ReservaHome,
  SedeCanchaHome,
  SedeHome,
  TipoCanchaHome,
} from '../modelos/home-cliente-modelo';

@Injectable({
  providedIn: 'root',
})
export class ClienteServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  listarClientes(): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuario/clientes`);
  }

  buscarPorNombre(nombre: string): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(
      `${this.url}/usuario/clientes-nombre/${encodeURIComponent(nombre)}`,
    );
  }

  buscarPorDni(dni: string): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(
      `${this.url}/usuario/clientes-dni/${encodeURIComponent(dni)}`,
    );
  }

  buscarPorEstado(estado: boolean): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuario/clientes-estado/${estado}`);
  }

  buscarPorTelefono(telefono: string): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(
      `${this.url}/usuarios-clientes-telefono/${encodeURIComponent(telefono)}`,
    );
  }

  buscarPorDominioCorreo(dominio: string): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(
      `${this.url}/usuarios-clientes-correo/${encodeURIComponent(dominio)}`,
    );
  }

  buscarPorCantidadReservas(cantidad: number): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuario-clientes-reservas/${cantidad}`);
  }

  actualizarCliente(
    cliente: Partial<ClienteModelo> & { idUsuario: number },
  ): Observable<ClienteModelo> {
    return this.http.put<ClienteModelo>(`${this.url}/usuario-actualizar`, cliente);
  }

  cambiarEstado(idUsuario: number, activo: boolean): Observable<ClienteModelo> {
    return this.http.put<ClienteModelo>(
      `${this.url}/usuario/${idUsuario}/estado?estado=${activo}`,
      {},
    );
  }

  obtenerReservasCliente(idUsuario: number): Observable<ReservaModelo[]> {
    return this.http.get<ReservaModelo[]>(`${this.url}/reserva/usuario/${idUsuario}`);
  }

  obtenerCantidadReservas(idUsuario: number): Observable<number> {
    return this.http.get<number>(`${this.url}/reservas-cantidad/usuario/${idUsuario}`);
  }

  // Obtener usuario autenticado: cliente o administrador
  obtenerUsuario(correo: string, idRol: number): Observable<UsuarioModelo> {
    return this.http.get<UsuarioModelo>(
      this.url + '/obtener-usuario?correo=' + encodeURIComponent(correo) + '&idRol=' + idRol,
    );
  }

  // ED55 Actualizar usuario
  actualizarPerfil(usuario: UsuarioModelo): Observable<UsuarioModelo> {
    return this.http.put<UsuarioModelo>(this.url + '/usuario-actualizar', usuario);
  }

  // ED02 - Obtener reservas del cliente
  obtenerReservas(idUsuario: number): Observable<ReservaHome[]> {
    return this.http.get<ReservaHome[]>(this.url + '/reserva/usuario/' + idUsuario);
  }

  // ED11 - Obtener próximas reservas
  obtenerProximas(idUsuario: number): Observable<ReservaHome[]> {
    return this.http.get<ReservaHome[]>(this.url + '/reservas-proximas/usuario/' + idUsuario);
  }

  // ED12 - Obtener solicitudes de reserva
  obtenerSolicitadas(idUsuario: number): Observable<ReservaHome[]> {
    return this.http.get<ReservaHome[]>(this.url + '/reservas-solicitadas/usuario/' + idUsuario);
  }

  // Obtener canchas no establecido como endpoint en el backend están desactivadas muy mal la verdad
  obtenerCanchas(): Observable<SedeCanchaHome[]> {
    return this.http.get<SedeCanchaHome[]>(this.url + '/canchas');
  }

  // Obtener sedes
  obtenerSedes(): Observable<SedeHome[]> {
    return this.http.get<SedeHome[]>(this.url + '/sedes');
  }

  // Obtener tipos de cancha
  obtenerTiposCancha(): Observable<TipoCanchaHome[]> {
    return this.http.get<TipoCanchaHome[]>(this.url + '/tipoCanchas');
  }
}
