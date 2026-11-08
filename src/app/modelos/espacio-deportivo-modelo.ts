export class TipoCanchaModelo {
  idTipoCancha: number;
  deporte: string;
  descripcion?: string;
  aforo?: number;
  fechaCreacion?: string;
}

export class SedeModelo {
  idSede: number;
  nombre: string;
  distrito?: string;
  direccion?: string;
  urlUbicacion?: string;
}

export class SedeCanchaModelo {
  idSedeCancha: number;
  nombre: string;
  estado: boolean;
  precio: number;
  imgCancha?: string;
  sede?: SedeModelo;
  cancha?: TipoCanchaModelo;
}
