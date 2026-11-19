import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { DetalleCanchaDatos } from '../../../modelos/reserva-modelo';

// Muestra los datos de una cancha (nombre, descripción, deporte, aforo, precio e imagen).
// Los datos los envía el componente c8 al abrir el diálogo.
@Component({
  imports: [DecimalPipe, MatButton, MatIcon, MatDialogClose],
  selector: 'app-c9-detalles-cancha-dialogo',
  styleUrl: './c9-detalles-cancha-dialogo.css',
  templateUrl: './c9-detalles-cancha-dialogo.html',
})
export class C9DetallesCanchaDialogo {
  protected datos: DetalleCanchaDatos = inject(MAT_DIALOG_DATA);
}
