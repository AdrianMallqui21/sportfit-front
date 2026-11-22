import { Component, OnInit, AfterViewInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import {
  BannerReservasModelo,
  ReservaModelo
} from '../../modelos/solicitud-reserva-modelo';
import {
  SedeCanchaModelo,
  SedeModelo,
  TipoCanchaModelo
} from '../../modelos/espacio-deportivo-modelo';
import { ReservaServicio } from '../../servicios/reserva-servicio';
import { ClienteServicio } from '../../servicios/cliente-servicio';
import { ClienteModelo } from '../../modelos/cliente-modelo';
import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';
import { CredencialesDTOModelo } from '../../modelos/credenciales-dto-modelo';
import { A19EditarReservaDialogo } from './a19-editar-reserva-dialogo/a19-editar-reserva-dialogo';
import { A21DesactivarReservaDialogo } from './a21-desactivar-reserva-dialogo/a21-desactivar-reserva-dialogo';

@Component({
  selector: 'app-a18-gestion-reservas-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatDialogModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
  templateUrl: './a18-gestion-reservas-componente.html',
  styleUrl: './a18-gestion-reservas-componente.css'
})
export class A18GestionReservasComponente implements OnInit, AfterViewInit {
  private readonly reservaServicio = inject(ReservaServicio);
  private readonly clienteServicio = inject(ClienteServicio);
  private readonly authServicio = inject(AutorizacionServicio);
  private readonly dialog = inject(MatDialog);

  // Columnas de MatTable (Vista a18)
  columnasReservas: string[] = ['sede', 'cancha', 'fecha', 'horario', 'estado'];
  dataSource: MatTableDataSource<ReservaModelo> = new MatTableDataSource<ReservaModelo>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Signals principales
  reservas = signal<ReservaModelo[]>([]);
  todasReservas = signal<ReservaModelo[]>([]);
  reservaSeleccionada = signal<ReservaModelo | null>(null);
  bannerReservas = signal<BannerReservasModelo | null>(null);
  sedes = signal<SedeModelo[]>([]);
  tiposCancha = signal<TipoCanchaModelo[]>([]);
  canchas = signal<SedeCanchaModelo[]>([]);
  clientes = signal<ClienteModelo[]>([]);

  cargando = signal<boolean>(false);
  errorCarga = signal<string | null>(null);
  mensajeFeedback = signal<string | null>(null);
  alertaAutenticacion = signal<boolean>(false);
  iniciandoSesionRapida = signal<boolean>(false);

  // Filtros (Vista a18 / ED61)
  filtroEstado = '';
  filtroSede: number | null = null;
  filtroDeporte: number | null = null;
  filtroFecha: Date | string | null = null;
  filtroHorario = '';

  // KPIs calculados
  totalReservas = computed(() => this.todasReservas().length);
  reservasActivas = computed(() =>
    this.todasReservas().filter(r => {
      const est = (r.estado || '').toLowerCase();
      return est === 'confirmada' || est === 'solicitada';
    }).length
  );
  reservasMes = computed(() => {
    const banner = this.bannerReservas();
    if (banner && banner.reservasMes !== undefined && banner.reservasMes !== null) {
      return banner.reservasMes;
    }
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();
    return this.todasReservas().filter(r => {
      if (!r.fReserva) return false;
      const partes = r.fReserva.split('-');
      if (partes.length < 2) return false;
      return parseInt(partes[0], 10) === anioActual && parseInt(partes[1], 10) === mesActual;
    }).length;
  });

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.alertaAutenticacion.set(true);
    }
    this.cargarCatalogos();
    this.cargarReservas();
    this.cargarBanner();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  cargarCatalogos(): void {
    this.reservaServicio.listarSedes().subscribe({
      next: (data) => this.sedes.set(data || []),
      error: () => this.sedes.set([])
    });
    this.reservaServicio.listarTiposCancha().subscribe({
      next: (data) => this.tiposCancha.set(data || []),
      error: () => this.tiposCancha.set([])
    });
    this.reservaServicio.listarCanchas().subscribe({
      next: (data) => this.canchas.set(data || []),
      error: () => this.canchas.set([])
    });
    this.clienteServicio.listarClientes().subscribe({
      next: (data) => this.clientes.set(data || []),
      error: () => this.clientes.set([])
    });
  }

  cargarBanner(): void {
    this.reservaServicio.cargarBannerReservas().subscribe({
      next: (data) => this.bannerReservas.set(data),
      error: () => this.bannerReservas.set(null)
    });
  }

  // ED16: Listar todas las reservas
  cargarReservas(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.reservaServicio.listarReservas().subscribe({
      next: (data) => {
        const lista = data || [];
        this.todasReservas.set(lista);
        this.reservas.set(lista);
        this.dataSource.data = lista;
        if (this.sort) this.dataSource.sort = this.sort;
        if (this.paginator) this.dataSource.paginator = this.paginator;

        const actual = this.reservaSeleccionada();
        if (actual) {
          const actualizada = lista.find(r => r.idReserva === actual.idReserva);
          this.reservaSeleccionada.set(actualizada || (lista.length > 0 ? lista[0] : null));
        } else if (lista.length > 0) {
          this.reservaSeleccionada.set(lista[0]);
        }

        this.alertaAutenticacion.set(false);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          this.alertaAutenticacion.set(true);
        }
        this.errorCarga.set('No se pudo conectar con el servidor para obtener las reservas.');
        this.cargando.set(false);
      }
    });
  }

  seleccionarReserva(reserva: ReservaModelo): void {
    this.reservaSeleccionada.set(reserva);
  }

  // ED61: Buscar con filtros concatenados
  aplicarFiltros(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    const fechaIso = this.convertirFechaAISO(this.filtroFecha);

    const hayFiltroBack =
      !!this.filtroEstado ||
      (this.filtroSede !== null && this.filtroSede > 0) ||
      (this.filtroDeporte !== null && this.filtroDeporte > 0) ||
      !!fechaIso;

    const peticion$ = hayFiltroBack
      ? this.reservaServicio.filtrarReservas(
          this.filtroEstado || null,
          this.filtroSede,
          this.filtroDeporte,
          fechaIso
        )
      : this.reservaServicio.listarReservas();

    peticion$.subscribe({
      next: (data) => {
        let lista = data || [];
        if (this.filtroHorario) {
          lista = lista.filter(r => this.coincideFranjaHoraria(r.hInicio, this.filtroHorario));
        }
        this.reservas.set(lista);
        this.dataSource.data = lista;
        if (this.paginator) this.paginator.firstPage();
        this.reservaSeleccionada.set(lista.length > 0 ? lista[0] : null);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('Error al filtrar las reservas.');
        this.cargando.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroSede = null;
    this.filtroDeporte = null;
    this.filtroFecha = null;
    this.filtroHorario = '';
    this.cargarReservas();
  }

  private convertirFechaAISO(valor: Date | string | null): string | null {
    if (!valor) return null;
    if (valor instanceof Date && !isNaN(valor.getTime())) {
      const y = valor.getFullYear();
      const m = String(valor.getMonth() + 1).padStart(2, '0');
      const d = String(valor.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof valor === 'string') {
      const texto = valor.trim();
      if (!texto) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
      const slash = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (slash) {
        return `${slash[3]}-${slash[2].padStart(2, '0')}-${slash[1].padStart(2, '0')}`;
      }
    }
    return null;
  }

  private coincideFranjaHoraria(horaInicio: string, franja: string): boolean {
    if (!horaInicio) return false;
    const hora = parseInt(horaInicio.split(':')[0], 10);
    if (franja === 'manana') return hora >= 6 && hora < 12;
    if (franja === 'tarde') return hora >= 12 && hora < 18;
    if (franja === 'noche') return hora >= 18 && hora <= 23;
    return true;
  }

  // --- MODAL VISTA a19: Editar información (MatDialog) ---
  abrirModalEditar(): void {
    const r = this.reservaSeleccionada();
    if (!r) return;

    const estadoActual = (r.estado || '').toLowerCase();
    if (estadoActual === 'cancelada' || estadoActual === 'completada' || estadoActual === 'rechazada') {
      this.mostrarMensaje(`No se puede editar una reserva en estado "${this.etiquetaEstado(r.estado)}".`);
      return;
    }

    const dialogRef = this.dialog.open(A19EditarReservaDialogo, {
      width: '960px',
      maxWidth: '96vw',
      data: {
        reserva: r,
        todasReservas: this.todasReservas(),
        canchas: this.canchas(),
        sedes: this.sedes(),
        tiposCancha: this.tiposCancha(),
        clientes: this.clientes()
      }
    });

    dialogRef.afterClosed().subscribe(actualizado => {
      if (actualizado) {
        this.cargarReservas();
        this.cargarBanner();
        this.mostrarMensaje('Reserva actualizada correctamente.');
      }
    });
  }

  // --- MODAL VISTA a21: Desactivar / Cancelar Reserva (MatDialog) ---
  abrirModalCancelar(): void {
    const r = this.reservaSeleccionada();
    if (!r) return;

    if ((r.estado || '').toLowerCase() !== 'confirmada') {
      this.mostrarMensaje('Solo se pueden cancelar reservas en estado "Confirmada".');
      return;
    }

    const dialogRef = this.dialog.open(A21DesactivarReservaDialogo, {
      width: '420px',
      maxWidth: '95vw',
      data: r
    });

    dialogRef.afterClosed().subscribe(cancelado => {
      if (cancelado) {
        this.cargarReservas();
        this.cargarBanner();
        this.mostrarMensaje('Reserva cancelada correctamente. El horario ha sido liberado.');
      }
    });
  }

  // Helpers de formato y presentación
  obtenerIdSedeCancha(r: ReservaModelo): number {
    return r.sedeCancha?.idSedeCancha ?? (r as any).idSedeCancha ?? 0;
  }

  obtenerCanchaDeReserva(r: ReservaModelo): SedeCanchaModelo | null {
    if (r.sedeCancha && r.sedeCancha.nombre) return r.sedeCancha;
    const idCancha = this.obtenerIdSedeCancha(r);
    if (!idCancha) return null;
    return this.canchas().find(c => c.idSedeCancha === idCancha) || null;
  }

  buscarNombreSede(idSede?: number | null): string {
    if (!idSede) return '';
    return this.sedes().find(s => s.idSede === idSede)?.nombre || '';
  }

  buscarNombreDeporte(idTipoCancha?: number | null): string {
    if (!idTipoCancha) return '';
    return this.tiposCancha().find(t => t.idTipoCancha === idTipoCancha)?.deporte || '';
  }

  obtenerNombreSede(r: ReservaModelo): string {
    const sc = this.obtenerCanchaDeReserva(r);
    return (
      sc?.sede?.nombre ||
      this.buscarNombreSede(sc?.idSedeSede) ||
      r.sede ||
      'Sede SportFit'
    );
  }

  obtenerNombreCanchaDeporte(r: ReservaModelo): string {
    const sc = this.obtenerCanchaDeReserva(r);
    const deporte =
      sc?.cancha?.deporte ||
      this.buscarNombreDeporte(sc?.idTipoCancha) ||
      r.deporte ||
      '';
    const cancha = sc?.nombre || r.cancha || '';
    if (deporte && cancha) return `${deporte} - ${cancha}`;
    return cancha || deporte || 'Cancha';
  }

  obtenerNombreCliente(r: ReservaModelo): string {
    if (r.usuario) {
      const full = `${r.usuario.nombre || ''} ${r.usuario.apellido || ''}`.trim();
      if (full) return full;
      if (r.usuario.correo) return r.usuario.correo;
    }
    const idUser = (r as any).idUsuario;
    if (idUser) {
      const cli = this.clientes().find(u => u.idUsuario === idUser);
      if (cli) return `${cli.nombre || ''} ${cli.apellido || ''}`.trim() || cli.correo;
    }
    return 'Cliente';
  }

  obtenerCorreoCliente(r: ReservaModelo): string {
    if (r.usuario?.correo) return r.usuario.correo;
    const idUser = (r as any).idUsuario;
    if (idUser) {
      return this.clientes().find(u => u.idUsuario === idUser)?.correo || '';
    }
    return '';
  }

  obtenerPrecio(r: ReservaModelo): number {
    const sc = this.obtenerCanchaDeReserva(r);
    return sc?.precio ?? r.montoTotal ?? 0;
  }

  obtenerImagenCancha(r: ReservaModelo): string {
    const sc = this.obtenerCanchaDeReserva(r);
    return sc?.imgCancha || '';
  }

  formatearHora(hora?: string): string {
    if (!hora) return '--:--';
    return hora.slice(0, 5);
  }

  formatearFechaCorta(fechaIso?: string): string {
    if (!fechaIso) return '—';
    const soloFecha = fechaIso.split('T')[0];
    const partes = soloFecha.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return soloFecha;
  }

  etiquetaEstado(estado?: string): string {
    const est = (estado || '').toLowerCase();
    if (est === 'confirmada') return 'Confirmado';
    if (est === 'solicitada') return 'Pendiente';
    if (est === 'cancelada') return 'Cancelada';
    if (est === 'completada') return 'Finalizado';
    if (est === 'rechazada') return 'Rechazada';
    return estado || '—';
  }

  claseEstado(estado?: string): string {
    const est = (estado || '').toLowerCase();
    if (est === 'confirmada') return 'badge-confirmado';
    if (est === 'solicitada') return 'badge-pendiente';
    if (est === 'cancelada' || est === 'rechazada') return 'badge-cancelada';
    return 'badge-finalizado';
  }

  mostrarMensaje(msg: string): void {
    this.mensajeFeedback.set(msg);
    setTimeout(() => this.mensajeFeedback.set(null), 4000);
  }

  iniciarSesionAdmin(): void {
    this.iniciandoSesionRapida.set(true);
    const cred = new CredencialesDTOModelo();
    cred.correo = 'admin@sportfit.com';
    cred.password = 'admin123';
    this.authServicio.accederCliente(cred).subscribe({
      next: () => {
        localStorage.setItem('rol', 'ROLE_ADMINISTRADOR');
        this.iniciandoSesionRapida.set(false);
        this.alertaAutenticacion.set(false);
        this.cargarCatalogos();
        this.cargarReservas();
        this.cargarBanner();
      },
      error: () => {
        this.iniciandoSesionRapida.set(false);
      }
    });
  }
}
