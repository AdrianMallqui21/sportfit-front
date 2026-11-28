import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';import { DecimalPipe } from '@angular/common';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import { ClienteServicio } from '../../servicios/cliente-servicio';
import { ReservaServicio } from '../../servicios/reserva-servicio';
import {
  FiltroMisReservas,
  MiReserva,
  SedeReserva,
  TipoCanchaReserva,
} from '../../modelos/reserva-modelo';
import { C14ConfirmarCancelacionDialogo } from './c14-confirmar-cancelacion-dialogo/c14-confirmar-cancelacion-dialogo';
import { C15ReservaCanceladaDialogo } from './c15-reserva-cancelada-dialogo/c15-reserva-cancelada-dialogo';
import { C16ImposibleCancelarDialogo } from './c16-imposible-cancelar-dialogo/c16-imposible-cancelar-dialogo';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  imports: [
    BarraLateral,
    MatCard,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatNativeDateModule,
    MatSuffix,
    MatSelect,
    MatOption,
    MatButton,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    DecimalPipe,
    MatSortModule,
    MatPaginatorModule,
  ],
  selector: 'app-c13-mis-reservas-cliente-componente',
  styleUrl: './c13-mis-reservas-cliente-componente.css',
  templateUrl: './c13-mis-reservas-cliente-componente.html',
})
export class C13MisReservasClienteComponente implements OnInit, AfterViewInit {
  private reservaServicio = inject(ReservaServicio);
  private clienteServicio = inject(ClienteServicio);
  private dialogo = inject(MatDialog);
  private detector = inject(ChangeDetectorRef);

  // ----- Usuario logueado -----
  idUsuario = 0;

  // ----- Datos que vienen del back -----
  sedes: SedeReserva[] = [];
  tiposCancha: TipoCanchaReserva[] = [];
  reservas: MiReserva[] = [];
  dataSource: MatTableDataSource<MiReserva> = new MatTableDataSource<MiReserva>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  reservaSeleccionada: MiReserva | null = null;
  mensajeError = '';

  // ----- Filtros (0, '' o null significan "sin elegir"; ninguno es obligatorio) -----
  sedeSeleccionada = 0;
  tipoCanchaSeleccionada = 0;
  estadoSeleccionado = '';
  fechaSeleccionada: Date | null = null;
  horaInicioSeleccionada = '';
  horaFinSeleccionada = '';

  readonly estados = ['solicitada', 'confirmada', 'rechazada', 'cancelada', 'completada'];
  readonly horasInicio = this.generarHoras(8, 22);
  readonly horasFin = this.generarHoras(9, 23);

  readonly displayedColumns = [
    'deporte',
    'cancha',
    'sede',
    'fecha',
    'horaInicio',
    'horaFin',
    'precio',
    'metodo',
    'estado',
  ];

  //Ordena y pagina la tabla
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    this.dataSource.sortingDataAccessor = (reserva, columna) => {
      switch (columna) {
        case 'fecha': {
          const [anio, mes, dia] = reserva.fReserva.split('-').map(Number);
          return anio * 10000 + mes * 100 + dia;
        }
        case 'precio':
          return reserva.montoTotal ?? Number.NEGATIVE_INFINITY;
        case 'sede':
          return reserva.sedeNombre?.toLocaleLowerCase() ?? '';
        default:
          return (reserva as unknown as Record<string, string | number>)[columna] ?? '';
      }
    };
  }

  // Se ejecuta al abrir la pantalla
  ngOnInit(): void {
    console.log('[Mis reservas] Paso 1: cargando sedes y deportes para los filtros');
    this.reservaServicio.listarSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes;
        this.detector.markForCheck();
      },
      error: (err) => this.mostrarError('No se pudieron cargar las sedes', err),
    });
    this.reservaServicio.listarTiposCancha().subscribe({
      next: (tipos) => {
        this.tiposCancha = tipos;
        this.detector.markForCheck();
      },
      error: (err) => this.mostrarError('No se pudieron cargar los deportes', err),
    });

    console.log('[Mis reservas] Paso 2: obteniendo el usuario logueado');
    const correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));
    this.clienteServicio.obtenerUsuario(correo, idRol).subscribe({
      next: (usuario) => {
        this.idUsuario = usuario.idUsuario;
        console.log('[Mis reservas] Usuario cargado, id', usuario.idUsuario);
        this.buscar(); // al entrar se muestran todas sus reservas
      },
      error: (err) => this.mostrarError('No se pudo obtener el usuario', err),
    });
  }

  // ----- Buscar y limpiar -----

  // Se ejecuta con el botón "Buscar":
  buscar(): void {
    if (!this.idUsuario) return;

    // Si se eligen las dos horas, la de fin debe ser posterior a la de inicio
    if (
      this.horaInicioSeleccionada &&
      this.horaFinSeleccionada &&
      this.horaFinSeleccionada <= this.horaInicioSeleccionada
    ) {
      this.mensajeError = 'La hora fin debe ser posterior a la hora inicio';
      return;
    }
    this.mensajeError = '';

    const filtros: FiltroMisReservas = {
      idSede: this.sedeSeleccionada || undefined,
      idTipoCancha: this.tipoCanchaSeleccionada || undefined,
      estado: this.estadoSeleccionado || undefined,
      fecha: this.fechaSeleccionada ? this.formatearFechaIso(this.fechaSeleccionada) : undefined,
      horaInicio: this.horaInicioSeleccionada || undefined,
      horaFin: this.horaFinSeleccionada || undefined,
    };
    console.log('[Mis reservas] Paso 3: buscando reservas con los filtros', filtros);

    this.reservaServicio.listarMisReservas(this.idUsuario, filtros).subscribe({
      next: (reservas) => {
        this.reservas = reservas;
        this.dataSource.data = reservas;
        this.paginator?.firstPage();

        this.reservaSeleccionada = null;
        console.log('[Mis reservas] Reservas encontradas:', reservas.length);
        this.detector.markForCheck();
      },
      error: (err) => this.mostrarError('No se pudieron obtener las reservas', err),
    });
  }

  // Se ejecuta con el botón "Limpiar":
  limpiar(): void {
    this.sedeSeleccionada = 0;
    this.tipoCanchaSeleccionada = 0;
    this.estadoSeleccionado = '';
    this.fechaSeleccionada = null;
    this.horaInicioSeleccionada = '';
    this.horaFinSeleccionada = '';
    this.buscar();
  }

  // ----- Selección de fila y cancelación -----

  seleccionarFila(reserva: MiReserva): void {
    this.reservaSeleccionada =
      this.reservaSeleccionada?.idReserva === reserva.idReserva ? null : reserva;
  }

  cancelarReserva(): void {
    const reserva = this.reservaSeleccionada;
    if (!reserva) return;

    if (reserva.estado.toLowerCase() !== 'confirmada') {
      console.log('[Mis reservas] No se puede cancelar: estado', reserva.estado);
      this.dialogo.open(C16ImposibleCancelarDialogo, {
        data: reserva.estado,
        width: '480px',
        maxWidth: '92vw',
      });
      return;
    }

    // El diálogo de elegir motivo de cancelacion
    this.dialogo
      .open(C14ConfirmarCancelacionDialogo, { width: '480px', maxWidth: '92vw' })
      .afterClosed()
      .subscribe((motivo: string | undefined) => {
        if (motivo) this.enviarCancelacion(reserva.idReserva, motivo);
      });
  }

  // Envía la cancelación al back. Si sale bien, muestra c15 y actualiza la tabla.
  private enviarCancelacion(idReserva: number, motivo: string): void {
    console.log('[Mis reservas] Cancelando la reserva', idReserva, 'motivo:', motivo);
    this.reservaServicio.cancelarReserva({ idReserva, tipoCancelacion: motivo }).subscribe({
      next: () => {
        console.log('[Mis reservas] Reserva cancelada correctamente');
        this.dialogo.open(C15ReservaCanceladaDialogo, { width: '480px', maxWidth: '92vw' });
        this.buscar(); // la reserva ahora aparece como 'cancelada'
      },
      error: (err) => this.mostrarError('No se pudo cancelar la reserva', err),
    });
  }

  // ----- Utilidades para la tabla -----

  // Convierte 'yyyy-MM-dd' en 'dd/mm/yyyy'.
  textoFecha(fechaIso: string): string {
    const [anio, mes, dia] = fechaIso.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  // Convierte '09:00:00' en '09:00'.
  textoHora(hora: string): string {
    return hora.substring(0, 5);
  }

  // Convierte 'FUTBOL' en 'Futbol' (y 'confirmada' en 'Confirmada').
  textoDeporte(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  // Color de fondo de la celda de deporte.
  colorDeporte(deporte: string): string {
    const colores: Record<string, string> = {
      FUTBOL: '#c9ffc0',
      VOLEY: '#ffffb5',
      TENIS: '#ffb3c1',
      BASKET: '#ffd9a8',
      FUTSAL: '#c7e6ff',
    };
    return colores[deporte.toUpperCase()] ?? '#eeeeee';
  }

  // Convierte una fecha en 'yyyy-MM-dd'.
  private formatearFechaIso(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  // Genera horas en punto: generarHoras(8, 10) devuelve ['08:00', '09:00', '10:00'].
  private generarHoras(desde: number, hasta: number): string[] {
    return Array.from(
      { length: hasta - desde + 1 },
      (_, i) => `${String(desde + i).padStart(2, '0')}:00`,
    );
  }

  // Guarda y muestra un error. Usa el mensaje que manda el back si existe.
  private mostrarError(mensaje: string, err: any): void {
    console.error('[Mis reservas] ' + mensaje, err);
    this.mensajeError = err?.error?.message || mensaje;
    this.detector.markForCheck();
  }
}
