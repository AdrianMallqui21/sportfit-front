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
