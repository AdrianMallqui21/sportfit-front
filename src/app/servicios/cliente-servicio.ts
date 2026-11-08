import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClienteModelo } from '../modelos/cliente-modelo';
import { ReservaModelo } from '../modelos/solicitud-reserva-modelo';

@Injectable({
  providedIn: 'root'
})
export class ClienteServicio {
  private url = environment.apiUrl;
  private http: HttpClient = inject(HttpClient);

  listarClientes(): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuario/clientes`);
  }

  buscarPorNombre(nombre: string): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuario/clientes-nombre/${encodeURIComponent(nombre)}`);
  }

  buscarPorDni(dni: string): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuario/clientes-dni/${encodeURIComponent(dni)}`);
  }

  buscarPorEstado(estado: boolean): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuario/clientes-estado/${estado}`);
  }

  buscarPorTelefono(telefono: string): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuarios-clientes-telefono/${encodeURIComponent(telefono)}`);
  }

  buscarPorDominioCorreo(dominio: string): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuarios-clientes-correo/${encodeURIComponent(dominio)}`);
  }

  buscarPorCantidadReservas(cantidad: number): Observable<ClienteModelo[]> {
    return this.http.get<ClienteModelo[]>(`${this.url}/usuario-clientes-reservas/${cantidad}`);
  }

  actualizarCliente(cliente: Partial<ClienteModelo> & { idUsuario: number }): Observable<ClienteModelo> {
    return this.http.put<ClienteModelo>(`${this.url}/usuario-actualizar`, cliente);
  }

  cambiarEstado(idUsuario: number, activo: boolean): Observable<ClienteModelo> {
    return this.http.put<ClienteModelo>(`${this.url}/usuario/${idUsuario}/estado?estado=${activo}`, {});
  }

  obtenerReservasCliente(idUsuario: number): Observable<ReservaModelo[]> {
    return this.http.get<ReservaModelo[]>(`${this.url}/reserva/usuario/${idUsuario}`);
  }

  obtenerCantidadReservas(idUsuario: number): Observable<number> {
    return this.http.get<number>(`${this.url}/reservas-cantidad/usuario/${idUsuario}`);
  }
}
