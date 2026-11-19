import { Component, OnInit, AfterViewInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClienteModelo } from '../../modelos/cliente-modelo';
import { ReservaModelo } from '../../modelos/solicitud-reserva-modelo';
import { ClienteServicio } from '../../servicios/cliente-servicio';
import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';
import { CredencialesDTOModelo } from '../../modelos/credenciales-dto-modelo';
import { A15EditarClienteDialogo } from './a15-editar-cliente-dialogo/a15-editar-cliente-dialogo';
import { A16ReservasClienteDialogo } from './a16-reservas-cliente-dialogo/a16-reservas-cliente-dialogo';
import { A17DesactivarClienteDialogo } from './a17-desactivar-cliente-dialogo/a17-desactivar-cliente-dialogo';

@Component({
  selector: 'app-a14-gestion-clientes-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './a14-gestion-clientes-componente.html',
  styleUrl: './a14-gestion-clientes-componente.css'
})
export class A14GestionClientesComponente implements OnInit, AfterViewInit {
  private readonly clienteService = inject(ClienteServicio);
  private readonly authServicio = inject(AutorizacionServicio);
  private readonly fb = inject(FormBuilder);
  private readonly dialogo = inject(MatDialog);

  // Columnas para MatTable
  columnasClientes: string[] = ['foto', 'nombres', 'fechaRegistro', 'dni', 'cantidadReservas'];
  columnasReservas: string[] = ['sede', 'cancha', 'fecha', 'horario', 'estado', 'monto', 'accion'];

  // DataSource para la tabla estándar con Sort y Paginator (estándar del profesor)
  dataSource: MatTableDataSource<ClienteModelo> = new MatTableDataSource<ClienteModelo>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Lista principal y cliente seleccionado
  clientes = signal<ClienteModelo[]>([]);
  todosClientes = signal<ClienteModelo[]>([]);
  clienteSeleccionado = signal<ClienteModelo | null>(null);
  cargando = signal<boolean>(false);
  errorCarga = signal<string | null>(null);
  alertaAutenticacion = signal<boolean>(false);
  iniciandoSesionRapida = signal<boolean>(false);

  // Reservas del cliente seleccionado (ED02)
  reservasHistorial = signal<ReservaModelo[]>([]);
  reservaDetalleModal = signal<ReservaModelo | null>(null);
  errorEdicion = signal<string | null>(null);
  reservasConfirmadasCliente = computed(() =>
    this.reservasHistorial().filter(r => (r.estado || '').toLowerCase() === 'confirmada').length
  );
  reservasCanceladasCliente = computed(() =>
    this.reservasHistorial().filter(r => (r.estado || '').toLowerCase() === 'cancelada').length
  );

  // Filtros de búsqueda (Escenarios 2 - 7)
  filtroNombre = '';
  filtroDni = '';
  filtroTelefono = '';
  filtroCorreo = '';
  filtroEstado = ''; // '' = Todos, 'true' = Activos, 'false' = Inactivos
  filtroReservas: number | null = null;

  // Estados de diálogos / modales (Vistas a15, a16, a17)
  modalEditarAbierto = false;
  modalReservasAbierto = false;
  modalDesactivarAbierto = false;

  // Formulario Reactivo para edición (Vista a15, ED55 - Estándar del profesor)
  formEdicion: FormGroup;

  mensajeFeedback = signal<string | null>(null);

  // Métricas calculadas para los KPIs
  totalRegistros = computed(() => this.clientes().length);
  usuariosActivos = computed(() => this.clientes().filter(c => c.activo).length);
  nuevosEsteMes = computed(() => {
    const mesActual = new Date().getMonth() + 1;
    return this.clientes().filter(c => {
      if (!c.fCreacion) return false;
      const partes = c.fCreacion.split(/[-/]/);
      return partes.length >= 2 && parseInt(partes[1], 10) === mesActual;
    }).length;
  });

  constructor() {
    this.formEdicion = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.alertaAutenticacion.set(true);
    }
    this.cargarClientes();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // ED51: Listar todos los clientes
  cargarClientes(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.clienteService.listarClientes().subscribe({
      next: (data) => {
        const lista = data || [];
        this.todosClientes.set(lista);
        this.clientes.set(lista);
        this.dataSource.data = lista;
        if (this.sort) this.dataSource.sort = this.sort;
        if (this.paginator) this.dataSource.paginator = this.paginator;

        if (lista.length > 0 && !this.clienteSeleccionado()) {
          this.seleccionarCliente(lista[0]);
        }
        // Consultar la cantidad de reservas para cada cliente (ED08)
        lista.forEach(c => {
          this.clienteService.obtenerCantidadReservas(c.idUsuario).subscribe({
            next: (cantidad) => {
              c.cantidadReservas = cantidad;
              this.todosClientes.set([...this.todosClientes()]);
              this.clientes.set([...this.clientes()]);
              this.dataSource.data = [...this.clientes()];
            }
          });
        });
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          this.alertaAutenticacion.set(true);
        }
        this.errorCarga.set('No se pudo conectar con el servidor para obtener los clientes.');
        this.cargando.set(false);
      }
    });
  }

  seleccionarCliente(cliente: ClienteModelo): void {
    this.clienteSeleccionado.set(cliente);
    this.cargarReservasCliente(cliente.idUsuario);
  }

  cargarReservasCliente(idUsuario: number): void {
    this.clienteService.obtenerReservasCliente(idUsuario).subscribe({
      next: (reservas) => {
        const listaReservas = reservas || [];
        this.reservasHistorial.set(listaReservas);
        const actual = this.clienteSeleccionado();
        if (actual && actual.idUsuario === idUsuario) {
          actual.cantidadReservas = listaReservas.length;
        }
      },
      error: () => this.reservasHistorial.set([])
    });
  }

  // --- ESCENARIOS DE BÚSQUEDA Y FILTRADO ---
  aplicarFiltros(): void {
    if (this.filtroNombre.trim()) {
      this.clienteService.buscarPorNombre(this.filtroNombre.trim()).subscribe({
        next: (res) => this.actualizarLista(res)
      });
      return;
    }

    if (this.filtroDni.trim()) {
      this.clienteService.buscarPorDni(this.filtroDni.trim()).subscribe({
        next: (res) => this.actualizarLista(res)
      });
      return;
    }

    if (this.filtroTelefono.trim()) {
      this.clienteService.buscarPorTelefono(this.filtroTelefono.trim()).subscribe({
        next: (res) => this.actualizarLista(res)
      });
      return;
    }

    if (this.filtroCorreo.trim()) {
      this.clienteService.buscarPorDominioCorreo(this.filtroCorreo.trim()).subscribe({
        next: (res) => this.actualizarLista(res)
      });
      return;
    }

    if (this.filtroEstado !== '') {
      this.clienteService.buscarPorEstado(this.filtroEstado === 'true').subscribe({
        next: (res) => this.actualizarLista(res)
      });
      return;
    }

    if (this.filtroReservas !== null && this.filtroReservas !== undefined && String(this.filtroReservas).trim() !== '' && Number(this.filtroReservas) >= 0) {
      const minimo = Number(this.filtroReservas);
      const filtrados = this.todosClientes().filter(c => (c.cantidadReservas ?? 0) >= minimo);
      this.actualizarLista(filtrados);
      return;
    }

    this.cargarClientes();
  }

  private actualizarLista(lista: ClienteModelo[]): void {
    const res = lista || [];
    this.clientes.set(res);
    this.dataSource.data = res;
    if (res.length > 0) {
      this.seleccionarCliente(res[0]);
      res.forEach(c => {
        this.clienteService.obtenerCantidadReservas(c.idUsuario).subscribe({
          next: (cantidad) => {
            c.cantidadReservas = cantidad;
            this.clientes.set([...this.clientes()]);
            this.dataSource.data = [...this.clientes()];
          }
        });
      });
    } else {
      this.clienteSeleccionado.set(null);
      this.reservasHistorial.set([]);
    }
  }

  limpiarFiltros(): void {
    this.filtroNombre = '';
    this.filtroDni = '';
    this.filtroTelefono = '';
    this.filtroCorreo = '';
    this.filtroEstado = '';
    this.filtroReservas = null;
    this.cargarClientes();
  }

  // --- VISTA a15: EDICIÓN DE CLIENTE (MatDialog) ---
  abrirModalEditar(): void {
    const c = this.clienteSeleccionado();
    if (!c) return;
    const ref = this.dialogo.open(A15EditarClienteDialogo, {
      width: '540px',
      maxWidth: '95vw',
      data: c
    });

    ref.afterClosed().subscribe((clienteFinal: ClienteModelo | null | undefined) => {
      if (clienteFinal) {
        const listaActual = this.clientes().map(item =>
          item.idUsuario === clienteFinal.idUsuario ? clienteFinal : item
        );
        this.clientes.set(listaActual);
        this.dataSource.data = listaActual;
        this.clienteSeleccionado.set(clienteFinal);
        this.mostrarMensaje('Información actualizada correctamente');
      }
    });
  }

  // --- VISTA a16: LISTADO DE RESERVAS (MatDialog) ---
  abrirModalReservas(): void {
    const c = this.clienteSeleccionado();
    if (!c) return;
    this.dialogo.open(A16ReservasClienteDialogo, {
      width: '920px',
      maxWidth: '95vw',
      data: {
        cliente: c,
        reservas: this.reservasHistorial()
      }
    });
  }

  obtenerCanchaDeporteReserva(r: ReservaModelo): string {
    const deporte = r.sedeCancha?.cancha?.deporte || r.deporte || '';
    const cancha = r.sedeCancha?.nombre || r.cancha || '';
    if (deporte && cancha) return `${deporte} - ${cancha}`;
    return cancha || deporte || 'Cancha';
  }

  formatearHora(hora?: string): string {
    return hora ? hora.slice(0, 5) : '--:--';
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

  // --- VISTA a17: DESACTIVAR USUARIO (MatDialog) ---
  abrirModalDesactivar(): void {
    const c = this.clienteSeleccionado();
    if (!c) return;
    const ref = this.dialogo.open(A17DesactivarClienteDialogo, {
      width: '430px',
      maxWidth: '95vw',
      data: c
    });

    ref.afterClosed().subscribe((clienteModificado: ClienteModelo | null | undefined) => {
      if (clienteModificado) {
        const listaActual = this.clientes().map(item =>
          item.idUsuario === clienteModificado.idUsuario ? clienteModificado : item
        );
        this.clientes.set(listaActual);
        this.dataSource.data = listaActual;
        this.clienteSeleccionado.set(clienteModificado);
        this.mostrarMensaje(`Estado del cliente actualizado a: ${clienteModificado.activo ? 'Activo' : 'Inactivo'}`);
      }
    });
  }

  mostrarMensaje(mensaje: string): void {
    this.mensajeFeedback.set(mensaje);
    setTimeout(() => {
      this.mensajeFeedback.set(null);
    }, 4000);
  }

  // Autenticación rápida de prueba para administradores
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
        this.errorCarga.set(null);
        this.cargarClientes();
      },
      error: () => {
        this.iniciandoSesionRapida.set(false);
      }
    });
  }
}
