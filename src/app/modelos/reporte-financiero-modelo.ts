export class IngresoDiarioModelo {
  fecha: string;
  ingresos: number;
  cantidadPagos: number;
}

export class DistribucionPagoModelo {
  metodoPago: string;
  totalRecaudado: number;
  cantidadTransacciones: number;
}

export class BannerPagoReporteModelo {
  recaudacionTotal: number;
  promedioDiario: number;
  diaPico: number;
  pagosRealizados: number;
}
