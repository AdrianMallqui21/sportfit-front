export interface IngresoDiarioDTO {
  fecha: string; // formato YYYY-MM-DD
  ingresos: number;
  cantidadPagos: number;
} // ED41

export interface DistribucionPagoDTO {
  metodoPago: 'Plin' | 'Transferencia' | 'Yape' | string;
  totalRecaudado: number;
  cantidadTransacciones: number;
  porcentaje?: number;
} // ED42

export interface BannerPagoReporte {
  recaudacionTotal: number;
  promedioDiario: number;
  diaPicoMonto: number;
  diaPicoFecha: string;
  pagosRealizados: number;
} // ED62
