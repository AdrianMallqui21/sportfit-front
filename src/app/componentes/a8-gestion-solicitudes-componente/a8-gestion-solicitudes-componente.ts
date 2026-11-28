import { Component, OnInit, AfterViewInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
  SolicitudReservaModelo,
  ReservaModelo
} from '../../modelos/solicitud-reserva-modelo';
import { SedeCanchaModelo, SedeModelo, TipoCanchaModelo } from '../../modelos/espacio-deportivo-modelo';
import { ClienteModelo } from '../../modelos/cliente-modelo';
import { SolicitudReservaServicio } from '../../servicios/solicitud-reserva-servicio';
import { EspacioDeportivoServicio } from '../../servicios/espacio-deportivo-servicio';
import { ClienteServicio } from '../../servicios/cliente-servicio';
import { A8ComprobantePagoDialogo } from './a8-comprobante-pago-dialogo/a8-comprobante-pago-dialogo';
import { A9ResultadoSolicitudDialogo } from './a9-resultado-solicitud-dialogo/a9-resultado-solicitud-dialogo';

@Component({
  selector: 'app-a8-gestion-solicitudes-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
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
  templateUrl: './a8-gestion-solicitudes-componente.html',
  styleUrl: './a8-gestion-solicitudes-componente.css'
})
export class A8GestionSolicitudesComponente implements OnInit, AfterViewInit {
  private readonly solicitudServicio = inject(SolicitudReservaServicio);
  private readonly espacioServicio = inject(EspacioDeportivoServicio);
  private readonly clienteServicio = inject(ClienteServicio);
  private readonly dialog = inject(MatDialog);

  // Columnas para MatTable (Vista a7)
  columnasSolicitudes: string[] = ['sede', 'canchasDeporte', 'fecha', 'horario', 'estado'];
  dataSource: MatTableDataSource<ReservaModelo> = new MatTableDataSource<ReservaModelo>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Listas y estados
  solicitudes = signal<ReservaModelo[]>([]);
  solicitudesFiltradas = signal<ReservaModelo[]>([]);
  sedes = signal<SedeModelo[]>([]);
  canchas = signal<SedeCanchaModelo[]>([]);
  tiposCancha = signal<TipoCanchaModelo[]>([]);
  clientes = signal<ClienteModelo[]>([]);
  solicitudSeleccionada = signal<ReservaModelo | null>(null);
  detalleCompleto = signal<SolicitudReservaModelo | null>(null);
  totalReservasCliente = signal<number>(0);

  // Filtros de búsqueda (Vista a7)
  filtroSede = '';
  filtroFecha: Date | string | null = null;
  filtroHorario = '';
  filtroDeporte = '';

  // Opciones desplegables para Horario
  readonly opcionesHorario = [
    { valor: '', etiqueta: 'Ingrese horario' },
    { valor: '07:00', etiqueta: '07:00 - 09:00' },
    { valor: '08:00', etiqueta: '08:00 - 10:00' },
    { valor: '09:00', etiqueta: '09:00 - 11:00' },
    { valor: '10:00', etiqueta: '10:00 - 12:00' },
    { valor: '12:00', etiqueta: '12:00 - 14:00' },
    { valor: '14:00', etiqueta: '14:00 - 16:00' },
    { valor: '15:00', etiqueta: '15:00 - 17:00' },
    { valor: '16:00', etiqueta: '16:00 - 18:00' },
    { valor: '17:00', etiqueta: '17:00 - 19:00' },
    { valor: '18:00', etiqueta: '18:00 - 20:00' },
    { valor: '19:00', etiqueta: '19:00 - 21:00' },
    { valor: '20:00', etiqueta: '20:00 - 22:00' }
  ];

  // Opciones desplegables para Deporte
  readonly opcionesDeporte = [
    { valor: '', etiqueta: 'Ingrese el deporte' },
    { valor: 'FUTBOL', etiqueta: 'Fútbol' },
    { valor: 'FUTSAL', etiqueta: 'Futsal' },
    { valor: 'TENIS', etiqueta: 'Tenis' },
    { valor: 'BASQUET', etiqueta: 'Básquet' },
    { valor: 'VOLEY', etiqueta: 'Vóley' }
  ];

  // Estados de carga y autenticación
  cargando = signal<boolean>(false);
  alertaAutenticacion = signal<boolean>(false);
  iniciandoSesionRapida = signal<boolean>(false);

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.alertaAutenticacion.set(true);
    }
    this.cargarCatalogos();
    this.cargarSolicitudes();
  }

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (item: ReservaModelo, property: string): string => {
      if (property === 'sede') return this.formatearSede(item).toLowerCase();
      if (property === 'canchasDeporte') return this.formatearCanchaDeporte(item).toLowerCase();
      if (property === 'fecha') return item.fReserva || '';
      if (property === 'horario') return item.hInicio || '';
      if (property === 'estado') return (item.estado || '').toLowerCase();
      return '';
    };
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  cargarCatalogos(): void {
    this.solicitudServicio.listarSedes().subscribe({
      next: (data) => {
        this.sedes.set(data || []);
        this.rehidratarSolicitudes();
      },
      error: () => this.sedes.set([])
    });

    this.espacioServicio.listarTiposCancha().subscribe({
      next: (data) => {
        this.tiposCancha.set(data || []);
        this.rehidratarSolicitudes();
      },
      error: () => this.tiposCancha.set([])
    });

    this.espacioServicio.listarCanchas().subscribe({
      next: (data) => {
        this.canchas.set(data || []);
        this.rehidratarSolicitudes();
      },
      error: () => this.canchas.set([])
    });

    this.clienteServicio.listarClientes().subscribe({
      next: (data) => {
        this.clientes.set(data || []);
        this.rehidratarSolicitudes();
      },
      error: () => this.clientes.set([])
    });
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.solicitudServicio.listarSolicitudes().subscribe({
      next: (data) => {
        const lista = (data || []).map(s => this.enriquecerSolicitud(s));
        this.solicitudes.set(lista);
        this.aplicarFiltros();
        this.alertaAutenticacion.set(false);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          this.alertaAutenticacion.set(true);
        }
      }
    });
  }

  private rehidratarSolicitudes(): void {
    if (this.solicitudes().length === 0) return;
    const lista = this.solicitudes().map(s => this.enriquecerSolicitud(s));
    this.solicitudes.set(lista);
    const selActual = this.solicitudSeleccionada();
    if (selActual) {
      const selAct = lista.find(item => item.idReserva === selActual.idReserva);
      if (selAct) this.solicitudSeleccionada.set(selAct);
    }
    this.aplicarFiltros();
  }

  private enriquecerSolicitud(s: ReservaModelo): ReservaModelo {
    const idCancha = s.sedeCancha?.idSedeCancha ?? (s as any).idSedeCancha;
    const idUsuario = s.usuario?.idUsuario ?? (s as any).idUsuario;

    const canchaBase = this.canchas().find(c => c.idSedeCancha === idCancha) || s.sedeCancha;
    let sedeCanchaEnriquecida = canchaBase;

    if (canchaBase) {
      const idSede = canchaBase.idSedeSede ?? canchaBase.sede?.idSede;
      const idTipo = canchaBase.idTipoCancha ?? canchaBase.cancha?.idTipoCancha;
      const sedeObj = this.sedes().find(sd => sd.idSede === idSede) || canchaBase.sede;
      const tipoObj = this.tiposCancha().find(t => t.idTipoCancha === idTipo) || canchaBase.cancha;
      sedeCanchaEnriquecida = {
        ...canchaBase,
        idSedeSede: idSede,
        idTipoCancha: idTipo,
        sede: sedeObj,
        cancha: tipoObj
      };
    }

    const clienteObj = this.clientes().find(cl => cl.idUsuario === idUsuario);
    const usuarioEnriquecido = clienteObj
      ? {
          idUsuario: clienteObj.idUsuario,
          nombre: clienteObj.nombre,
          apellido: clienteObj.apellido,
          correo: clienteObj.correo,
          telefono: clienteObj.telefono
        }
      : s.usuario;

    return {
      ...s,
      sedeCancha: sedeCanchaEnriquecida,
      usuario: usuarioEnriquecido
    };
  }

  // --- FILTROS DE BÚSQUEDA (Vista a7) ---
  aplicarFiltros(): void {
    let lista = this.solicitudes();

    // 1. Filtro Sede (por idSede o nombre)
    if (this.filtroSede) {
      const idSedeNum = Number(this.filtroSede);
      lista = lista.filter(s => {
        const idSedeSol = s.sedeCancha?.idSedeSede ?? s.sedeCancha?.sede?.idSede;
        if (!isNaN(idSedeNum) && idSedeNum > 0 && idSedeSol) {
          return idSedeSol === idSedeNum;
        }
        const nombreSede = this.formatearSede(s).toLowerCase();
        return nombreSede.includes(String(this.filtroSede).toLowerCase());
      });
    }

    // 2. Filtro Fecha
    const fechaStr = this.convertirFechaAISO(this.filtroFecha);
    if (fechaStr) {
      lista = lista.filter(s => (s.fReserva || '').startsWith(fechaStr));
    }

    // 3. Filtro Horario
    if (this.filtroHorario) {
      lista = lista.filter(s => {
        const hIni = s.hInicio?.slice(0, 5) || '';
        return hIni.startsWith(this.filtroHorario);
      });
    }

    // 4. Filtro Deporte (normaliza tildes y variantes BASKET/BASQUET)
    if (this.filtroDeporte) {
      const buscado = this.normalizarTexto(this.filtroDeporte);
      lista = lista.filter(s => {
        const dep = this.normalizarTexto(s.sedeCancha?.cancha?.deporte || '');
        if (buscado === 'BASKET' || buscado === 'BASQUET') {
          return dep === 'BASKET' || dep === 'BASQUET';
        }
        return dep === buscado;
      });
    }

    this.solicitudesFiltradas.set(lista);
    this.dataSource.data = lista;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    if (lista.length > 0) {
      const sel = this.solicitudSeleccionada();
      const sigueEnLista = sel && lista.some(item => item.idReserva === sel.idReserva);
      if (!sigueEnLista) {
        this.seleccionarSolicitud(lista[0]);
      }
    } else {
      this.solicitudSeleccionada.set(null);
      this.detalleCompleto.set(null);
    }
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

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }

  limpiarFiltros(): void {
    this.filtroSede = '';
    this.filtroFecha = null;
    this.filtroHorario = '';
    this.filtroDeporte = '';
    const todas = this.solicitudes();
    this.solicitudesFiltradas.set(todas);
    this.dataSource.data = todas;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    if (todas.length > 0) {
      this.seleccionarSolicitud(todas[0]);
    }
  }

  // --- HELPERS DE FORMATEO PARA LA TABLA ---
  formatearSede(s: any): string {
    const nombre = s?.sedeCancha?.sede?.nombre || s?.sede || 'Surco';
    return nombre.replace(/^Sede\s+/i, '');
  }

  formatearNombreCancha(s: any): string {
    return s?.sedeCancha?.nombre || 'Cancha Principal';
  }

  obtenerMontoTotal(): number {
    const pagos = this.detalleCompleto()?.pagos;
    if (pagos && pagos.length > 0 && pagos[0].montoTotal) {
      return Number(pagos[0].montoTotal);
    }
    const sol = this.solicitudSeleccionada();
    if (sol?.sedeCancha?.precio) {
      return Number(sol.sedeCancha.precio) * this.calcularHoras(sol.hInicio, sol.hFin);
    }
    return 42;
  }

  formatearCanchaDeporte(s: any): string {
    const deporteRaw = s?.sedeCancha?.cancha?.deporte || 'Fútbol';
    let deporte = deporteRaw.charAt(0).toUpperCase() + deporteRaw.slice(1).toLowerCase();
    if (deporte.toLowerCase() === 'futbol') deporte = 'Fútbol';
    if (deporte.toLowerCase() === 'basquet') deporte = 'Básquet';

    const cancha = s?.sedeCancha?.nombre || 'Cancha';
    return `${deporte} - ${cancha}`;
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '—';
    if (fechaStr.includes('/')) return fechaStr;
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaStr;
  }

  formatearHorario(hInicio?: string, hFin?: string): string {
    const ini = hInicio ? hInicio.slice(0, 5) : '08:00';
    const fin = hFin ? hFin.slice(0, 5) : '10:00';
    return `${ini} - ${fin}`;
  }

  obtenerIconoDeporte(deporte?: string): string {
    const d = (deporte || '').toLowerCase();
    if (d.includes('tenis')) return 'sports_tennis';
    if (d.includes('basquet') || d.includes('básquet') || d.includes('basket')) return 'sports_basketball';
    if (d.includes('voley') || d.includes('voleibol')) return 'sports_volleyball';
    return 'sports_soccer';
  }

  // --- SELECCIÓN Y DETALLE (Vista a8) ---
  seleccionarSolicitud(solicitud: any): void {
    this.solicitudSeleccionada.set(solicitud);
    const id = solicitud.idReserva;

    if (id) {
      this.solicitudServicio.consultarDetalle(id).subscribe({
        next: (detalle) => {
          this.detalleCompleto.set(detalle);
        },
        error: () => {
          this.detalleCompleto.set(null);
        }
      });
    }

    const idUsuario = solicitud.usuario?.idUsuario ?? (solicitud as any).idUsuario;
    if (idUsuario) {
      this.clienteServicio.obtenerCantidadReservas(idUsuario).subscribe({
        next: (total: number) => this.totalReservasCliente.set(total ?? 0),
        error: () => this.totalReservasCliente.set(0)
      });
    } else {
      this.totalReservasCliente.set(0);
    }
  }

  calcularHoras(hInicio?: string, hFin?: string): number {
    if (!hInicio || !hFin) return 1;
    try {
      const [hIni] = hInicio.split(':').map(Number);
      const [hF] = hFin.split(':').map(Number);
      const dif = hF - hIni;
      return dif > 0 ? dif : 1;
    } catch {
      return 1;
    }
  }

  urlComprobanteActual(): string {
    const pagos = this.detalleCompleto()?.pagos;
    if (pagos && pagos.length > 0 && pagos[0].urlComprobante && pagos[0].urlComprobante.startsWith('http')) {
      return pagos[0].urlComprobante;
    }
    return '/imagenes/comprobante-yape.png';
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  // --- MODAL VISTA a8: Ver comprobante de pago (MatDialog) ---
  abrirComprobante(): void {
    this.dialog.open(A8ComprobantePagoDialogo, {
      width: '480px',
      maxWidth: '95vw',
      data: { urlComprobante: this.urlComprobanteActual() }
    });
  }

  // --- MODAL VISTA a9: Aprobación de solicitud (MatDialog ED25) ---
  aceptarSolicitud(): void {
    const s = this.solicitudSeleccionada();
    if (!s) return;

    this.solicitudServicio.actualizarEstado(s.idReserva, 'confirmada').subscribe({
      next: () => {
        const actualizadas = this.solicitudes().filter(item => item.idReserva !== s.idReserva);
        this.solicitudes.set(actualizadas);
        this.aplicarFiltros();
        this.dialog.open(A9ResultadoSolicitudDialogo, {
          width: '420px',
          maxWidth: '95vw',
          data: {
            titulo: 'Se aprobó la solicitud de reserva',
            descripcion: 'La solicitud de reserva fue aprobada correctamente. La reserva ahora figura como confirmada para la fecha y el horario solicitados.',
            tipo: 'aprobada'
          }
        });
      },
      error: (err: unknown) => {
        console.error('Error al confirmar reserva en el backend:', err);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'Error al comunicarse con el backend para aprobar la reserva.';
        alert(msg);
      }
    });
  }

  // --- MODAL VISTA a10: Rechazo de solicitud (MatDialog ED25) ---
  rechazarSolicitud(): void {
    const s = this.solicitudSeleccionada();
    if (!s) return;

    this.solicitudServicio.actualizarEstado(s.idReserva, 'rechazada').subscribe({
      next: () => {
        const actualizadas = this.solicitudes().filter(item => item.idReserva !== s.idReserva);
        this.solicitudes.set(actualizadas);
        this.aplicarFiltros();
        this.dialog.open(A9ResultadoSolicitudDialogo, {
          width: '420px',
          maxWidth: '95vw',
          data: {
            titulo: 'Se rechazó la solicitud de reserva',
            descripcion: 'La solicitud de reserva fue rechazada porque la información proporcionada está incompleta o contiene datos no válidos.',
            tipo: 'rechazada'
          }
        });
      },
      error: (err: unknown) => {
        console.error('Error al rechazar reserva en el backend:', err);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'Error al comunicarse con el backend para rechazar la reserva.';
        alert(msg);
      }
    });
  }

}
