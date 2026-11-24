export interface SedeReserva {
  idSede: number;
  nombre: string;
  distrito: string;
  direccion: string;
}

export interface TipoCanchaReserva {
  idTipoCancha: number;
  deporte: string;
  descripcion: string;
  aforo: number;
}

export interface CanchaReserva {
  idSedeCancha: number;
  nombre: string;
  estado: boolean;
  precio: number;
  imgCancha: string | null;
  idSedeSede: number;
  idTipoCancha: number;
}

export interface HorarioOcupado {
  idReserva: number;
  idSedeCancha: number;
  precio: number;
  aforo: number;
  horaInicio: string;
  horaFin: string;
}

export interface ReservaSolicitud {
  idSedeCancha: number;
  fReserva: string;
  hInicio: string;
  hFin: string;
  idUsuario: number;
  creadoPor: string;
}

export interface PagoSolicitud {
  montoTotal: number;
  metodo: string;
  urlComprobante: string;
}

export interface SolicitudReserva {
  reserva: ReservaSolicitud;
  pagos: PagoSolicitud[];
}

// ---- Datos que se pasan a los diálogos ----

export interface DetalleCanchaDatos {
  nombre: string;
  descripcion: string;
  deporte: string;
  aforo: number;
  precio: number;
  imagen: string | null;
}

export interface ResumenPagoDatos {
  fecha: string;
  deporte: string;
  sedeNombre: string;
  sedeDireccion: string;
  canchaNombre: string;
  horaInicio: string;
  horaFin: string;
  horas: number;
  precioHora: number;
  total: number;
}

export interface PagoDialogoResultado {
  metodo: string;
  urlComprobante: string;
}

// ---- Mis reservas ----

export interface MiReserva {
  idReserva: number;
  idSede: number;
  idTipoCancha: number;
  deporte: string;
  idSedeCancha: number;
  sedeNombre: string;
  fReserva: string;
  hInicio: string;
  hFin: string;
  montoTotal: number | null;
  metodo: string | null;
  estado: string;
}

export interface FiltroMisReservas {
  idSede?: number;
  idTipoCancha?: number;
  estado?: string;
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
}

export interface CancelacionSolicitud {
  idReserva: number;
  tipoCancelacion: string;
}

export class ReservaModelo {}

export class ReservaDeporteSedeModelo {
  deporte: string;
  sede: string;
  frecuencia: number;
}


export class DeporteParticipacionModelo {
  deporte: string;
  cantidad: number;
}


export class TendenciaAnualModelo {
  deporte: string;
  mes: number;
  cantidad: number;
}
