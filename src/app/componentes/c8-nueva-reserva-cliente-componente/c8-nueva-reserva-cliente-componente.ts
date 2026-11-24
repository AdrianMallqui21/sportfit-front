import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { MatCard } from '@angular/material/card';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable } from '@angular/material/table';
import { DecimalPipe, NgForOf } from '@angular/common';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { ReservaServicio } from '../../servicios/reserva-servicio';
import { MatDialog } from '@angular/material/dialog';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import {
  DetalleCanchaDatos,
  PagoDialogoResultado,
  ResumenPagoDatos,
  SolicitudReserva,
} from '../../modelos/reserva-modelo';
import { C9DetallesCanchaDialogo } from './c9-detalles-cancha-dialogo/c9-detalles-cancha-dialogo';
import { C10ReservaNoDisponibleDialogo } from './c10-reserva-no-disponible-dialogo/c10-reserva-no-disponible-dialogo';
import { C11ProcesoPagoDialogo } from './c11-proceso-pago-dialogo/c11-proceso-pago-dialogo';
import { C12SolicitudEnviadaDialogo } from './c12-solicitud-enviada-dialogo/c12-solicitud-enviada-dialogo';

import {
  CanchaReserva,
  HorarioOcupado,
  SedeReserva,
  TipoCanchaReserva,
} from '../../modelos/reserva-modelo';
import { forkJoin } from 'rxjs';

// Fila del cuadro: una cancha con su precio, aforo y las horas que están en rojo.
interface FilaCancha {
  idSedeCancha: number;
  nombre: string;
  precioHora: number;
  aforo: number;
  horasOcupadas: number[];
  imagen: string | null;
}

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
    MatIcon,
    MatIconButton,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    DecimalPipe,
    MatRowDef,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderCellDef,
    NgForOf,
  ],
  selector: 'app-c8-nueva-reserva-cliente-componente',
  styleUrl: './c8-nueva-reserva-cliente-componente.css',
  templateUrl: './c8-nueva-reserva-cliente-componente.html',
})
export class C8NuevaReservaClienteComponente implements OnInit {
  private reservaServicio = inject(ReservaServicio);
  private detector = inject(ChangeDetectorRef);
  private dialogo = inject(MatDialog);
  private clienteServicio = inject(ClienteServicio);

  // ----- Usuario que reserva (se carga al abrir la pantalla) -----
  idUsuario = 0;
  correo = '';

  // ----- Datos que vienen del back -----
  sedes: SedeReserva[] = [];
  tiposCancha: TipoCanchaReserva[] = [];
  dataSource: FilaCancha[] = [];
  busquedaHecha = false;
  mensajeError = '';

  // ----- Filtros -----
  readonly fechaMinima: Date = this.calcularManana();
  fechaSeleccionada: Date = this.fechaMinima;
  tipoCanchaSeleccionada = 0; //sin elegir =0
  sedeSeleccionada = 0;

  // ----- Selección de horas -----
  canchaSeleccionada: number | null = null;
  horasSeleccionadas: number[] = [];

  // Columnas de horas del cuadro
  readonly horarios = Array.from({ length: 15 }, (_, indice) => {
    const hora = indice + 8;
    const etiqueta = `${String(hora).padStart(2, '0')}:00`;
    return { id: `hora${String(hora).padStart(2, '0')}`, etiqueta, indice };
  });

  readonly displayedColumns = ['cancha', 'precio', 'aforo', ...this.horarios.map((h) => h.id)];

  // Se ejecuta al abrir la pantalla: carga los combos de Sede y Deporte.
  ngOnInit(): void {
    // obtener el usuario logueado
    this.correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));
    this.clienteServicio.obtenerUsuario(this.correo, idRol).subscribe({
      next: (usuario) => {
        this.idUsuario = usuario.idUsuario;
        console.log('[Nueva reserva] Paso 0: usuario cargado, id', usuario.idUsuario);
      },
      error: (err) => this.mostrarError('No se pudo obtener el usuario', err),
    });
    //Aqui llena los filtros de sede y deporte
    console.log('[Nueva reserva] Paso 1: cargando sedes y deportes');
    this.reservaServicio.listarSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes;
        console.log('[Nueva reserva] Sedes cargadas:', sedes.length);
        this.detector.markForCheck();
      },
      error: (err) => this.mostrarError('No se pudieron cargar las sedes', err),
    });
    this.reservaServicio.listarTiposCancha().subscribe({
      next: (tipos) => {
        this.tiposCancha = tipos;
        console.log('[Nueva reserva] Deportes cargados:', tipos.length);
        this.detector.markForCheck();
      },
      error: (err) => this.mostrarError('No se pudieron cargar los deportes', err),
    });
  }

  // ----- Datos calculados -----

  // Tipo de cancha (deporte) elegido en el combo.
  get tipoCanchaActual(): TipoCanchaReserva | undefined {
    return this.tiposCancha.find((t) => t.idTipoCancha === this.tipoCanchaSeleccionada);
  }

  // Fila (cancha) donde está la selección verde.
  get filaSeleccionada(): FilaCancha | undefined {
    return this.dataSource.find((f) => f.idSedeCancha === this.canchaSeleccionada);
  }

  // Hora de inicio y fin de la selección verde, en formato 'hh:mm'.
  get horaInicioSeleccionada(): string | null {
    if (this.horasSeleccionadas.length === 0) return null;
    const primera = this.horasSeleccionadas[0];
    return this.horarios[primera].etiqueta;
  }

  get horaFinSeleccionada(): string | null {
    if (this.horasSeleccionadas.length === 0) return null;
    const ultima = this.horasSeleccionadas[this.horasSeleccionadas.length - 1];
    const horaFin = ultima + 9;
    return `${String(horaFin).padStart(2, '0')}:00`;
  }

  // Precio total = precio por hora x cantidad de horas seleccionadas.
  get precioSeleccionado(): number | null {
    const fila = this.filaSeleccionada;
    if (!fila || this.horasSeleccionadas.length === 0) return null;
    return fila.precioHora * this.horasSeleccionadas.length;
  }

  get fechaAnterior(): Date {
    return this.moverFecha(this.fechaSeleccionada, -1);
  }

  get fechaSiguiente(): Date {
    return this.moverFecha(this.fechaSeleccionada, 1);
  }

  // Solo se puede retroceder mientras la fecha anterior sea mañana o después.
  get puedeRetroceder(): boolean {
    return this.fechaAnterior >= this.fechaMinima;
  }

  // ----- Fechas -----

  // Se ejecuta al elegir una fecha en el calendario.
  cambiarFecha(fecha: Date | null): void {
    if (!fecha) return;
    this.irAFecha(new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  }

  // Se ejecuta al pulsar la fecha del encabezado del cuadro.
  seleccionarFechaRapida(dias: number): void {
    this.irAFecha(this.moverFecha(this.fechaSeleccionada, dias));
  }

  // Se ejecuta con las flechas < y >.
  desplazarDia(dias: number): void {
    this.seleccionarFechaRapida(dias);
  }

  // Cambia la fecha. El filtro y "Datos de Reserva" leen la misma variable
  private irAFecha(nueva: Date): void {
    if (nueva < this.fechaMinima) {
      console.log('[Nueva reserva] La fecha mínima de reserva es mañana');
      return;
    }
    this.fechaSeleccionada = nueva;
    this.limpiarHorario();
    console.log('[Nueva reserva] Fecha cambiada a', this.formatearFechaIso(nueva));
    if (this.busquedaHecha) this.buscarDisponibilidad();
  }

  // ----- Buscar disponibilidad -----

  // Trae las canchas (filas) y los horarios ocupados (celdas rojas) y arma el cuadro.
  buscarDisponibilidad(): void {
    // validar que estén elegidos deporte y sede
    if (!this.tipoCanchaSeleccionada || !this.sedeSeleccionada) {
      this.mensajeError = 'Selecciona el deporte y la sede para buscar disponibilidad';
      return;
    }
    this.mensajeError = '';
    const fecha = this.formatearFechaIso(this.fechaSeleccionada);
    console.log('[Nueva reserva] Paso 2: buscando canchas y horarios ocupados', {
      fecha,
      sede: this.sedeSeleccionada,
      deporte: this.tipoCanchaSeleccionada,
    });

    forkJoin({
      canchas: this.reservaServicio.listarCanchas(
        this.sedeSeleccionada,
        this.tipoCanchaSeleccionada,
      ),
      ocupados: this.reservaServicio.listarHorariosOcupados(
        fecha,
        this.tipoCanchaSeleccionada,
        this.sedeSeleccionada,
      ),
    }).subscribe({
      next: ({ canchas, ocupados }) => {
        // armar las filas del cuadro
        this.dataSource = this.armarFilas(canchas, ocupados);
        this.busquedaHecha = true;
        this.limpiarHorario();
        console.log('[Nueva reserva] Paso 3: cuadro armado con', this.dataSource.length, 'canchas');
        this.detector.markForCheck();
      },
      error: (err) => {
        this.dataSource = [];
        this.busquedaHecha = false;
        this.mostrarError('No se pudo obtener la disponibilidad', err);
      },
    });
  }

  // Convierte las canchas y los horarios ocupados en las filas que dibuja la tabla.
  private armarFilas(canchas: CanchaReserva[], ocupados: HorarioOcupado[]): FilaCancha[] {
    const aforo = this.tipoCanchaActual?.aforo ?? 0;
    return canchas
      .map((cancha) => {
        const horasOcupadas: number[] = [];
        ocupados
          .filter((o) => o.idSedeCancha === cancha.idSedeCancha)
          .forEach((o) => {
            // Una reserva de 10:00 a 12:00 ocupa las posiciones 10:00 y 11:00
            const desde = this.horaAPosicion(o.horaInicio);
            const hasta = this.horaAPosicion(o.horaFin);
            for (let posicion = desde; posicion < hasta; posicion++) horasOcupadas.push(posicion);
          });
        return {
          idSedeCancha: cancha.idSedeCancha,
          nombre: cancha.nombre,
          precioHora: cancha.precio,
          aforo,
          horasOcupadas,
          imagen: cancha.imgCancha,
        };
      });
  }

  // Convierte '10:00:00' en la posición de la columna (08:00 = 0, 09:00 = 1, ...).
  private horaAPosicion(hora: string): number {
    return Number(hora.substring(0, 2)) - 8;
  }

  // ----- Celdas del cuadro -----

  // Una celda está ocupada si está en rojo
  estaOcupado(fila: FilaCancha, posicion: number): boolean {
    return fila.horasOcupadas.includes(posicion);
  }

  // Una celda está seleccionada si es de la cancha elegida y su posición está en la selección.
  estaSeleccionado(fila: FilaCancha, posicion: number): boolean {
    return (
      this.canchaSeleccionada === fila.idSedeCancha && this.horasSeleccionadas.includes(posicion)
    );
  }

  // Color de la celda: verde seleccionada, rojo ocupada, gris disponible.
  colorDisponibilidad(fila: FilaCancha, posicion: number): string {
    if (this.estaSeleccionado(fila, posicion)) return '#40b983';
    return this.estaOcupado(fila, posicion) ? '#ff6464' : '#eeeeee';
  }

  // Se ejecuta al hacer clic en una celda.
  seleccionarHorario(fila: FilaCancha, posicion: number): void {
    // Celda roja: se muestra el diálogo "Reserva no disponible"
    if (this.estaOcupado(fila, posicion)) {
      console.log('[Nueva reserva] Celda ocupada: se muestra el aviso');
      this.dialogo.open(C10ReservaNoDisponibleDialogo, { width: '480px', maxWidth: '92vw' });
      return;
    }

    // Otra cancha, o todavía no hay selección: empieza una selección nueva
    if (this.canchaSeleccionada !== fila.idSedeCancha || this.horasSeleccionadas.length === 0) {
      this.canchaSeleccionada = fila.idSedeCancha;
      this.horasSeleccionadas = [posicion];
      return;
    }

    const primera = this.horasSeleccionadas[0];
    const ultima = this.horasSeleccionadas[this.horasSeleccionadas.length - 1];

    if (this.horasSeleccionadas.includes(posicion)) {
      // Clic en una celda verde: se quita. Si era la primera se quita solo ella;
      // si era otra, se quita desde ahí hacia adelante para que las horas sigan seguidas.
      this.horasSeleccionadas =
        posicion === primera
          ? this.horasSeleccionadas.slice(1)
          : this.horasSeleccionadas.filter((p) => p < posicion);
      if (this.horasSeleccionadas.length === 0) this.canchaSeleccionada = null;
    } else if (posicion === ultima + 1) {
      this.horasSeleccionadas = [...this.horasSeleccionadas, posicion]; // pegada al final
    } else if (posicion === primera - 1) {
      this.horasSeleccionadas = [posicion, ...this.horasSeleccionadas]; // pegada al inicio
    } else {
      this.horasSeleccionadas = [posicion]; // no es seguida: empieza una selección nueva
    }
  }

  // ----- Utilidades -----

  // Muestra la fecha como dd/mm/yyyy (para pantalla).
  formatearFecha(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${fecha.getFullYear()}`;
  }

  // Muestra la fecha como yyyy-MM-dd (formato que entiende el back).
  formatearFechaIso(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  }

  // Quita la selección verde.
  private limpiarHorario(): void {
    this.canchaSeleccionada = null;
    this.horasSeleccionadas = [];
  }

  // Devuelve una fecha movida la cantidad de días indicada.
  private moverFecha(fecha: Date, dias: number): Date {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha;
  }

  // Devuelve la fecha de mañana a las 00:00 (fecha mínima para reservar).
  private calcularManana(): Date {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
  }

  // Guarda y muestra un error. Usa el mensaje que manda el back si existe.
  private mostrarError(mensaje: string, err: any): void {
    console.error('[Nueva reserva] ' + mensaje, err);
    this.mensajeError = err?.error?.message || mensaje;
    this.detector.markForCheck();
  }

  // Abre el diálogo con los datos de una cancha del campo seleccionado
  verDetallesCancha(): void {
    const fila = this.filaSeleccionada;
    const tipo = this.tipoCanchaActual;
    if (!fila || !tipo) return; // sin cancha seleccionada no hace nada

    const datos: DetalleCanchaDatos = {
      nombre: fila.nombre,
      descripcion: tipo.descripcion,
      deporte: tipo.deporte,
      aforo: tipo.aforo,
      precio: fila.precioHora,
      imagen: fila.imagen,
    };
    this.dialogo.open(C9DetallesCanchaDialogo, { data: datos, width: '720px', maxWidth: '92vw' });
  }

  // Se ejecuta con el botón amarillo "Solicitar reserva":
  solicitarReserva(): void {
    const fila = this.filaSeleccionada;
    const sede = this.sedes.find((s) => s.idSede === this.sedeSeleccionada);
    if (
      !fila ||
      !sede ||
      !this.horaInicioSeleccionada ||
      !this.horaFinSeleccionada ||
      this.precioSeleccionado === null
    )
      return;
    if (!this.idUsuario) {
      this.mensajeError = 'No se pudo identificar al usuario. Vuelve a iniciar sesión';
      return;
    }

    const resumen: ResumenPagoDatos = {
      fecha: this.formatearFecha(this.fechaSeleccionada),
      deporte: this.tipoCanchaActual?.deporte ?? '',
      sedeNombre: sede.nombre,
      sedeDireccion: sede.direccion,
      canchaNombre: fila.nombre,
      horaInicio: this.horaInicioSeleccionada,
      horaFin: this.horaFinSeleccionada,
      horas: this.horasSeleccionadas.length,
      precioHora: fila.precioHora,
      total: this.precioSeleccionado,
    };

    this.dialogo
      .open(C11ProcesoPagoDialogo, { data: resumen, width: '860px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((pago: PagoDialogoResultado | undefined) => {
        // pago llega vacío si el usuario canceló el diálogo
        if (pago) this.enviarSolicitud(pago);
      });
  }

  // Arma la solicitud y la envía al back (una sola llamada crea la reserva y su pago).
  private enviarSolicitud(pago: PagoDialogoResultado): void {
    const solicitud: SolicitudReserva = {
      reserva: {
        idSedeCancha: this.canchaSeleccionada!,
        fReserva: this.formatearFechaIso(this.fechaSeleccionada),
        hInicio: this.horaInicioSeleccionada + ':00', // '09:00' -> '09:00:00'
        hFin: this.horaFinSeleccionada + ':00',
        idUsuario: this.idUsuario,
        creadoPor: this.correo,
      },
      pagos: [
        {
          montoTotal: this.precioSeleccionado!,
          metodo: pago.metodo,
          urlComprobante: pago.urlComprobante,
        },
      ],
    };

    console.log('[Nueva reserva] Enviando solicitud de reserva');
    this.reservaServicio.solicitarReserva(solicitud).subscribe({
      next: () => {
        console.log('[Nueva reserva] Solicitud enviada correctamente');
        this.dialogo.open(C12SolicitudEnviadaDialogo, { width: '480px', maxWidth: '92vw' });
        this.buscarDisponibilidad(); // actualiza el cuadro: la reserva nueva sale en rojo
      },
      error: (err) => {
        if (err.status === 409) {
          // Otro usuario tomó el horario mientras se llenaba el pago
          console.log('[Nueva reserva] Horario ya tomado (409)');
          this.dialogo.open(C10ReservaNoDisponibleDialogo, { width: '480px', maxWidth: '92vw' });
          this.buscarDisponibilidad();
        } else {
          this.mostrarError('No se pudo enviar la solicitud de reserva', err);
        }
      },
    });
  }
}
