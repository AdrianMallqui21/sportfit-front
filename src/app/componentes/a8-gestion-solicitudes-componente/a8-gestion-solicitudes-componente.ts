import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  SolicitudReservaModelo,
  PagoDetalleModelo,
  ReservaModelo
} from '../../modelos/solicitud-reserva-modelo';
import { SedeModelo } from '../../modelos/espacio-deportivo-modelo';
import { SolicitudReservaServicio } from '../../servicios/solicitud-reserva-servicio';
import { ClienteServicio } from '../../servicios/cliente-servicio';
import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';
import { CredencialesDTOModelo } from '../../modelos/credenciales-dto-modelo';

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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter()
  ],
  templateUrl: './a8-gestion-solicitudes-componente.html',
  styleUrl: './a8-gestion-solicitudes-componente.css'
})
export class A8GestionSolicitudesComponente implements OnInit {
  private readonly solicitudServicio = inject(SolicitudReservaServicio);
  private readonly clienteServicio = inject(ClienteServicio);
  private readonly authServicio = inject(AutorizacionServicio);

  // Columnas para MatTable (Vista a7)
  columnasSolicitudes: string[] = ['sede', 'canchasDeporte', 'fecha', 'horario', 'estado'];

  // Listas y estados
  solicitudes = signal<ReservaModelo[]>([]);
  solicitudesFiltradas = signal<ReservaModelo[]>([]);
  sedes = signal<SedeModelo[]>([]);
  solicitudSeleccionada = signal<ReservaModelo | null>(null);
  detalleCompleto = signal<SolicitudReservaModelo | null>(null);
  totalReservasCliente = signal<number>(0);

  // Filtros de búsqueda (Angular Material)
  filtroSede = '';
  filtroFecha: Date | null = null;
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
    { valor: '16:00', etiqueta: '16:00 - 18:00' }
  ];

  // Opciones desplegables para Deporte
  readonly opcionesDeporte = [
    { valor: '', etiqueta: 'Ingrese el deporte' },
    { valor: 'FUTBOL', etiqueta: 'Fútbol' },
    { valor: 'TENIS', etiqueta: 'Tenis' },
    { valor: 'BASQUET', etiqueta: 'Básquet' },
    { valor: 'VOLEY', etiqueta: 'Vóley' }
  ];

  // Modales (Vistas a8, a9, a10)
  modalComprobanteAbierto = false;
  modalAprobadoAbierto = false;
  modalRechazadoAbierto = false;

  // Estados de carga y autenticación
  cargando = signal<boolean>(false);
  alertaAutenticacion = signal<boolean>(false);
  iniciandoSesionRapida = signal<boolean>(false);

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.alertaAutenticacion.set(true);
    }
    this.cargarSedes();
    this.cargarSolicitudes();
  }

  cargarSedes(): void {
    this.solicitudServicio.listarSedes().subscribe({
      next: (data) => this.sedes.set(data || []),
      error: () => this.sedes.set([])
    });
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.solicitudServicio.listarSolicitudes().subscribe({
      next: (data) => {
        const lista = data || [];
        this.solicitudes.set(lista);
        this.solicitudesFiltradas.set(lista);
        this.alertaAutenticacion.set(false);

        if (lista.length > 0 && !this.solicitudSeleccionada()) {
          this.seleccionarSolicitud(lista[0]);
        }
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

  // --- FILTROS DE BÚSQUEDA (Vista a7) ---
  aplicarFiltros(): void {
    let lista = this.solicitudes();

    // 1. Filtro Sede
    if (this.filtroSede) {
      lista = lista.filter(s => {
        const nombreSede = s.sedeCancha?.sede?.nombre || s.sede || '';
        return nombreSede.toLowerCase().includes(this.filtroSede.toLowerCase());
      });
    }

    // 2. Filtro Fecha
    if (this.filtroFecha) {
      const year = this.filtroFecha.getFullYear();
      const month = String(this.filtroFecha.getMonth() + 1).padStart(2, '0');
      const day = String(this.filtroFecha.getDate()).padStart(2, '0');
      const fechaStr = `${year}-${month}-${day}`;

      lista = lista.filter(s => {
        const fecha = s.fReserva || '';
        return fecha.startsWith(fechaStr);
      });
    }

    // 3. Filtro Horario
    if (this.filtroHorario) {
      lista = lista.filter(s => {
        const hIni = s.hInicio?.slice(0, 5) || '';
        return hIni.startsWith(this.filtroHorario);
      });
    }

    // 4. Filtro Deporte
    if (this.filtroDeporte) {
      lista = lista.filter(s => {
        const deporte = s.sedeCancha?.cancha?.deporte || '';
        return deporte.toUpperCase().includes(this.filtroDeporte.toUpperCase());
      });
    }

    this.solicitudesFiltradas.set(lista);
    if (lista.length > 0) {
      this.seleccionarSolicitud(lista[0]);
    } else {
      this.solicitudSeleccionada.set(null);
      this.detalleCompleto.set(null);
    }
  }

  limpiarFiltros(): void {
    this.filtroSede = '';
    this.filtroFecha = null;
    this.filtroHorario = '';
    this.filtroDeporte = '';
    this.solicitudesFiltradas.set(this.solicitudes());
    if (this.solicitudes().length > 0) {
      this.seleccionarSolicitud(this.solicitudes()[0]);
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

    const idUsuario = solicitud.usuario?.idUsuario;
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

  onVoucherError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('comprobante-yape.png')) {
      img.src = '/imagenes/comprobante-yape.png';
    }
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  // --- MODAL VISTA a8: Ver comprobante de pago ---
  abrirComprobante(): void {
    this.modalComprobanteAbierto = true;
  }

  cerrarComprobante(): void {
    this.modalComprobanteAbierto = false;
  }

  // --- MODAL VISTA a9: Aprobación de solicitud (ED25) ---
  aceptarSolicitud(): void {
    const s = this.solicitudSeleccionada();
    if (!s) return;

    this.solicitudServicio.actualizarEstado(s.idReserva, 'confirmada').subscribe({
      next: (reservaActualizada) => {
        // Remover de la lista de solicitudes pendientes
        const actualizadas = this.solicitudes().filter(item => item.idReserva !== s.idReserva);
        this.solicitudes.set(actualizadas);
        this.aplicarFiltros();
        this.modalAprobadoAbierto = true;
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

  cerrarModalAprobado(): void {
    this.modalAprobadoAbierto = false;
  }

  // --- MODAL VISTA a10: Rechazo de solicitud (ED25) ---
  rechazarSolicitud(): void {
    const s = this.solicitudSeleccionada();
    if (!s) return;

    this.solicitudServicio.actualizarEstado(s.idReserva, 'rechazada').subscribe({
      next: (reservaActualizada) => {
        // Remover de la lista de solicitudes pendientes
        const actualizadas = this.solicitudes().filter(item => item.idReserva !== s.idReserva);
        this.solicitudes.set(actualizadas);
        this.aplicarFiltros();
        this.modalRechazadoAbierto = true;
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

  cerrarModalRechazado(): void {
    this.modalRechazadoAbierto = false;
  }

  // Autenticación rápida de prueba
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
        this.cargarSolicitudes();
      },
      error: () => {
        this.iniciandoSesionRapida.set(false);
      }
    });
  }
}
