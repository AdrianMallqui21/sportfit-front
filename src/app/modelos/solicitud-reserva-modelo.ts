import { SedeCanchaModelo } from './espacio-deportivo-modelo';

export class ReservaModelo {
  idReserva: number;
  fReserva: string;
  hInicio: string;
  hFin: string;
  estado: string;
  fCreacion?: string;
  modificadoPor?: string;
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

export class BannerReservasModelo {
  reservasMes: number;
  deportePopular: string;
  SedePopular?: string;
  sedePopular?: string;
}

export class ReservaHorarioModelo {
  idReserva: number;
  idSedeCancha: number;
  precio: number;
  aforo: number;
  horaInicio: string;
  horaFin: string;
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
