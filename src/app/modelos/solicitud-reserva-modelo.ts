import { SedeCanchaModelo } from './espacio-deportivo-modelo';

export class ReservaModelo {
  idReserva: number;
  fReserva: string;
  hInicio: string;
  hFin: string;
  estado: string;
  sede?: string;
  deporte?: string;
  cancha?: string;
  montoTotal?: number;
  usuario?: {
    idUsuario?: number;
    nombre?: string;
    apellido?: string;
    correo?: string;
  };
  sedeCancha?: SedeCanchaModelo | any;
}

export class PagoDetalleModelo {
  idPago: number;
  montoTotal: number;
  metodo: string;
  urlComprobante?: string;
}

export class SolicitudReservaModelo {
  reserva: ReservaModelo;
  pagos: PagoDetalleModelo[];
}
