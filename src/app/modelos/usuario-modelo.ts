export class UsuarioModelo {
  idUsuario: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  correo: string;
  activo: boolean;
  imgUsuario: string | null;
  creadoPor: string;
  modificadoPor: string | null;
  fCreacion: string;
  fModificacion: string | null;
  idRol: number;
}
