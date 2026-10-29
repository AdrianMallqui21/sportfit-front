export interface FiltroReservasClienteParams {
  fechaDesde?: string;
  fechaHasta?: string;
  minReservas?: number;
  maxReservas?: number;
  top?: number;
}

export interface ReservaClienteDTO {
  clienteId: string;     // Ej. "C001"
  nombreCliente: string; // Ej. "Tony Montana"
  ultimaReserva: string; // Ej. "2026-09-01"
  totalReservas: number; // Ej. 50
}
