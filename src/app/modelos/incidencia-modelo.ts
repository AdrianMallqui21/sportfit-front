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
