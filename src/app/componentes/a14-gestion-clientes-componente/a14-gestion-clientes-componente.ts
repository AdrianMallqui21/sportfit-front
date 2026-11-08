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

import { ClienteModelo } from '../../modelos/cliente-modelo';
import { ReservaModelo } from '../../modelos/solicitud-reserva-modelo';
import { ClienteServicio } from '../../servicios/cliente-servicio';
import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';
import { CredencialesDTOModelo } from '../../modelos/credenciales-dto-modelo';

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
    MatDialogModule
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
  clienteSeleccionado = signal<ClienteModelo | null>(null);
  cargando = signal<boolean>(false);
  errorCarga = signal<string | null>(null);
  alertaAutenticacion = signal<boolean>(false);
  iniciandoSesionRapida = signal<boolean>(false);

  // Reservas del cliente seleccionado (ED02)
  reservasHistorial = signal<ReservaModelo[]>([]);

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

    if (this.filtroReservas !== null && this.filtroReservas !== undefined && this.filtroReservas >= 0) {
      this.clienteService.buscarPorCantidadReservas(Number(this.filtroReservas)).subscribe({
        next: (res) => this.actualizarLista(res)
      });
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

  // --- VISTA a15: EDICIÓN DE CLIENTE (ED55 - Formulario Reactivo) ---
  abrirModalEditar(): void {
    const c = this.clienteSeleccionado();
    if (!c) return;
    this.formEdicion.patchValue({
      nombre: c.nombre || '',
      apellido: c.apellido || '',
      dni: c.dni || '',
      telefono: c.telefono || '',
      correo: c.correo || ''
    });
    this.modalEditarAbierto = true;
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
  }

  guardarEdicion(): void {
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    const c = this.clienteSeleccionado();
    if (!c) return;

    const datosActualizados: Partial<ClienteModelo> & { idUsuario: number } = {
      idUsuario: c.idUsuario,
      ...this.formEdicion.value
    };

    this.clienteService.actualizarCliente(datosActualizados).subscribe({
      next: (actualizado) => {
        const clienteFinal = { ...c, ...actualizado };
        const listaActual = this.clientes().map(item =>
          item.idUsuario === c.idUsuario ? clienteFinal : item
        );
        this.clientes.set(listaActual);
        this.dataSource.data = listaActual;
        this.clienteSeleccionado.set(clienteFinal);
        this.cerrarModalEditar();
        this.mostrarMensaje('Información actualizada correctamente');
      },
      error: () => {
        this.mostrarMensaje('Error al actualizar la información del cliente.');
      }
    });
  }

  // --- VISTA a16: LISTADO DE RESERVAS (ED02) ---
  abrirModalReservas(): void {
    const c = this.clienteSeleccionado();
    if (!c) return;
    this.cargarReservasCliente(c.idUsuario);
    this.modalReservasAbierto = true;
  }

  cerrarModalReservas(): void {
    this.modalReservasAbierto = false;
  }

  // --- VISTA a17: DESACTIVAR USUARIO (ED60) ---
  abrirModalDesactivar(): void {
    this.modalDesactivarAbierto = true;
  }

  cerrarModalDesactivar(): void {
    this.modalDesactivarAbierto = false;
  }

  confirmarDesactivar(): void {
    const c = this.clienteSeleccionado();
    if (!c) return;

    const nuevoEstado = !c.activo;
    this.clienteService.cambiarEstado(c.idUsuario, nuevoEstado).subscribe({
      next: () => {
        const clienteModificado = { ...c, activo: nuevoEstado };
        const listaActual = this.clientes().map(item =>
          item.idUsuario === c.idUsuario ? clienteModificado : item
        );
        this.clientes.set(listaActual);
        this.dataSource.data = listaActual;
        this.clienteSeleccionado.set(clienteModificado);
        this.cerrarModalDesactivar();
        this.mostrarMensaje(`Estado del cliente actualizado a: ${nuevoEstado ? 'Activo' : 'Inactivo'}`);
      },
      error: () => {
        this.mostrarMensaje('Error al cambiar el estado del usuario.');
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
