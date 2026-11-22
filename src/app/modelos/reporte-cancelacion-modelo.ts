// ED07: total de reservas canceladas de un mes y año
export class TotalCancelacionesModelo {
  totalCanceladas: number;
}

// ED06: dinero que se dejó de recibir por las reservas canceladas
export class MontoPerdidoModelo {
  montoPerdido: number;
}

// ED18: cuántas cancelaciones hubo por cada motivo (para las barras)
export class MotivoCancelacionModelo {
  tipoCancelacion: string;
  cantidad: number;
}

// ED19: cuántas cancelaciones hubo por mes y por motivo (para las líneas)
export class TendenciaCancelacionModelo {
  mes: number;
  tipoCancelacion: string;
  cantidad: number;
}

