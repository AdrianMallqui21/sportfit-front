import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DatosResultadoSolicitudDialogo {
  titulo: string;
  descripcion: string;
  tipo: 'aprobada' | 'rechazada';
}

@Component({
  selector: 'app-a9-resultado-solicitud-dialogo',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './a9-resultado-solicitud-dialogo.html',
  styleUrl: './a9-resultado-solicitud-dialogo.css'
})
export class A9ResultadoSolicitudDialogo {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DatosResultadoSolicitudDialogo) {}
}
