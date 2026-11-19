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
