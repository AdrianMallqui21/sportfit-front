// Modelos (interfaces) de la pantalla "Nueva reserva".
// Cada interface describe la forma del JSON que devuelve o recibe el back.

// Sede: viene de GET /api/sedes
export interface SedeReserva {
  idSede: number;
  nombre: string;
  distrito: string;
  direccion: string;
}

// Tipo de cancha (el "Deporte" del filtro): viene de GET /api/tipoCanchas
export interface TipoCanchaReserva {
  idTipoCancha: number;
  deporte: string;
  descripcion: string;
  aforo: number;
}

// Cancha de una sede (las filas del cuadro): GET /api/cancha/sede/{idSede}/deporte/{idTipoCancha}
export interface CanchaReserva {
  idSedeCancha: number;
  nombre: string;
  estado: boolean;
  precio: number;
  imgCancha: string | null;
  idSedeSede: number; // así se llama el id de la sede en el back
  idTipoCancha: number;
}

// Horario ocupado (las celdas en rojo): GET /api/reservas/horarios
export interface HorarioOcupado {
  idReserva: number;
  idSedeCancha: number;
  precio: number;
  aforo: number;
  horaInicio: string; // formato 'HH:mm:ss'
  horaFin: string;
}

// ---- Lo que se envía al pulsar "Enviar solicitud de reserva" (POST /api/reserva/solicitar) ----
export interface ReservaSolicitud {
  idSedeCancha: number;
  fReserva: string; // formato 'yyyy-MM-dd'
  hInicio: string; // formato 'HH:mm:ss'
  hFin: string;
  idUsuario: number; // id del cliente que reserva
  creadoPor: string; // correo del cliente
}

export interface PagoSolicitud {
  montoTotal: number; // lo calcula el front: precio por hora x horas
  metodo: string; // por ahora 'Yape'
  urlComprobante: string; // por ahora un texto con la URL
}

export interface SolicitudReserva {
  reserva: ReservaSolicitud;
  pagos: PagoSolicitud[];
}

// ---- Datos que se pasan a los diálogos ----

// Para el diálogo "Ver detalles de cancha"
export interface DetalleCanchaDatos {
  nombre: string;
  descripcion: string;
  deporte: string;
  aforo: number;
  precio: number;
  imagen: string | null;
}

// Para el diálogo "Proceso de pago"
export interface ResumenPagoDatos {
  fecha: string; // dd/mm/yyyy
  deporte: string;
  sedeNombre: string;
  sedeDireccion: string;
  canchaNombre: string;
  horaInicio: string;
  horaFin: string;
  horas: number;
  precioHora: number;
  total: number;
}

// Lo que devuelve el diálogo de pago al pulsar "Enviar solicitud de reserva"
export interface PagoDialogoResultado {
  metodo: string;
  urlComprobante: string;
}
