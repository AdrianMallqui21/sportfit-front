export class IncidenciaModelo {
  idIncidencia: number = 0;
  tipo: string = '';
  asunto: string = '';
  descripcion: string = '';
  estado: string = '';
  respuestaAdmin: string | null = null;
  fCreacion: string = '';
  fRespuesta: string | null = null;
  idUsuario: number = 0;
}

export class IncidenciaRegistroModelo {
  tipo: string = '';
  asunto: string = '';
  descripcion: string = '';
  idUsuario: number = 0;
}

export class BannerIncidenciasModelo {
  totalHistorico: number;
  pendientesMes: number;
  atendidasMes: number;
}

export class EstadoResolucionModelo {
  atendidas: number;
  pendientes: number;
  porcentajeAtendidas: number;
  porcentajePendientes: number;
}

export class TendenciaIncidenciasModelo {
  mes: string;
  atendidas: number;
  pendientes: number;
}

export class DistribucionCategoriaModelo {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}

export class SedeIncidenciaModelo {
  idSede: number;
  nombreSede: string;
  descripcionSede?: string;
  totalIncidencias: number;
  porcentajeTotal: number;
  resueltas: number;
  pendientes: number;
  color: string;
}
