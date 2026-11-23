export interface ReservaHome {
  idReserva: number;
  fReserva?: string;
  hInicio?: string;
  hFin?: string;
  freserva?: string;
  hinicio?: string;
  hfin?: string;
  estado: string;
  idUsuario: number;
  idSedeCancha: number;
}

export interface SedeCanchaHome {
  idSedeCancha: number;
  nombre: string;
  idSedeSede: number;
  idTipoCancha: number;
}

export interface SedeHome {
  idSede: number;
  nombre: string;
  distrito: string;
}

export interface TipoCanchaHome {
  idTipoCancha: number;
  deporte: string;
}
