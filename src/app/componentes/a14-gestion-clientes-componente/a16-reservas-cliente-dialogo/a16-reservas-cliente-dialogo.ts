import { Component, OnInit, AfterViewInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClienteModelo } from '../../../modelos/cliente-modelo';
import { ReservaModelo } from '../../../modelos/solicitud-reserva-modelo';
import { SedeCanchaModelo, SedeModelo, TipoCanchaModelo } from '../../../modelos/espacio-deportivo-modelo';
import { ClienteServicio } from '../../../servicios/cliente-servicio';
import { ReservaServicio } from '../../../servicios/reserva-servicio';

export interface DatosReservasClienteDialogo {
  cliente: ClienteModelo;
  reservas: ReservaModelo[];
}

@Component({
  selector: 'app-a16-reservas-cliente-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogClose,
    MatCardModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './a16-reservas-cliente-dialogo.html',
  styleUrl: './a16-reservas-cliente-dialogo.css'
})
export class A16ReservasClienteDialogo implements OnInit, AfterViewInit {
  private readonly clienteService = inject(ClienteServicio);
  private readonly reservaService = inject(ReservaServicio);
  readonly data: DatosReservasClienteDialogo = inject(MAT_DIALOG_DATA);

  columnasReservas: string[] = ['sede', 'cancha', 'fecha', 'horario', 'estado', 'monto', 'accion'];
  dataSource = new MatTableDataSource<ReservaModelo>(this.data?.reservas || []);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  reservasHistorial = signal<ReservaModelo[]>(this.data?.reservas || []);
  canchas = signal<SedeCanchaModelo[]>([]);
  sedes = signal<SedeModelo[]>([]);
  tiposCancha = signal<TipoCanchaModelo[]>([]);
  reservaDetalleModal = signal<ReservaModelo | null>(null);

  ngOnInit(): void {
    this.reservaService.listarCanchas().subscribe({
      next: (lista) => this.canchas.set(lista || []),
      error: () => this.canchas.set([])
    });

    this.reservaService.listarSedes().subscribe({
      next: (lista) => this.sedes.set(lista || []),
      error: () => this.sedes.set([])
    });

    this.reservaService.listarTiposCancha().subscribe({
      next: (lista) => this.tiposCancha.set(lista || []),
      error: () => this.tiposCancha.set([])
    });

    if (this.data?.cliente?.idUsuario) {
      this.clienteService.obtenerReservasCliente(this.data.cliente.idUsuario).subscribe({
        next: (lista) => {
          const items = lista || [];
          this.reservasHistorial.set(items);
          this.dataSource.data = items;
          if (this.sort) this.dataSource.sort = this.sort;
          if (this.paginator) this.dataSource.paginator = this.paginator;
        },
        error: () => {
          // Mantiene las reservas pasadas inicialmente si falla la recarga
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  verDetalleReservaModal(reserva: ReservaModelo): void {
    const actual = this.reservaDetalleModal();
    this.reservaDetalleModal.set(actual?.idReserva === reserva.idReserva ? null : reserva);
  }

  private obtenerCanchaDeReserva(r: ReservaModelo): SedeCanchaModelo | null {
    if (r.sedeCancha && r.sedeCancha.nombre) return r.sedeCancha;
    const idCancha = r.sedeCancha?.idSedeCancha ?? (r as any).idSedeCancha ?? 0;
    if (!idCancha) return null;
    return this.canchas().find(c => c.idSedeCancha === idCancha) || null;
  }

  obtenerSedeReserva(r: ReservaModelo): string {
    const sc = this.obtenerCanchaDeReserva(r);
    if (sc?.sede?.nombre) return sc.sede.nombre;
    const idSede = sc?.idSedeSede;
    if (idSede) {
      const sedeEncontrada = this.sedes().find(s => s.idSede === idSede);
      if (sedeEncontrada) return sedeEncontrada.nombre;
    }
    return r.sede || 'Sede Principal';
  }

  obtenerCanchaDeporteReserva(r: ReservaModelo): string {
    const sc = this.obtenerCanchaDeReserva(r);
    let deporte = sc?.cancha?.deporte || r.deporte || '';
    const idTipo = sc?.idTipoCancha;
    if (!deporte && idTipo) {
      const tipo = this.tiposCancha().find(t => t.idTipoCancha === idTipo);
      if (tipo) deporte = tipo.deporte;
    }
    const cancha = sc?.nombre || r.cancha || '';
    if (deporte && cancha) return `${deporte} - ${cancha}`;
    return cancha || deporte || 'Cancha';
  }

  obtenerMontoReserva(r: ReservaModelo): number {
    const sc = this.obtenerCanchaDeReserva(r);
    return r.montoTotal ?? sc?.precio ?? 0;
  }

  formatearHora(hora?: string): string {
    return hora ? hora.slice(0, 5) : '--:--';
  }

  formatearFechaGuion(fechaIso?: string): string {
    if (!fechaIso) return '—';
    const soloFecha = fechaIso.split('T')[0];
    const partes = soloFecha.split('-');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return soloFecha;
  }

  etiquetaEstadoReserva(estado?: string): string {
    const est = (estado || '').toLowerCase();
    if (est === 'confirmada') return 'Confirmado';
    if (est === 'solicitada') return 'Pendiente';
    if (est === 'completada') return 'Finalizado';
    if (est === 'cancelada') return 'Cancelada';
    if (est === 'rechazada') return 'Rechazada';
    return estado || '—';
  }
}
