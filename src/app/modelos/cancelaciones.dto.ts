export interface CancelacionDiaDTO {
  fecha: string;
  cantidadCanceladas: number;
} // Para ED05

export interface TotalCancelacionesDTO {
  totalCanceladas: number;
} // Para ED07

export interface MotivoCancelacionDTO {
  tipoCancelacion: string;
  cantidad: number;
  porcentaje: number;
} // Para ED18

export interface TendenciaCancelacionDTO {
  mes: string;
  tipoCancelacion: string;
  cantidad: number;
} // Para ED19

export interface MontoPerdidoDTO {
  montoPerdido: number;
  periodo: string;
} // Para ED06
