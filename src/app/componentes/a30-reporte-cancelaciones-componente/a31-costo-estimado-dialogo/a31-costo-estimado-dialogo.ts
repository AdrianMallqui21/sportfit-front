import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';

//Datos que el reporte le envía al diálogo
export class DatosCostoEstimado {
  monto: number;
  mes: number;
  anio: number;
}

// Los datos los envía el componente del reporte al abrirlo.
@Component({
  imports: [DecimalPipe, MatIconButton, MatIcon, MatDialogClose],
  selector: 'app-a31-costo-estimado-dialogo',
  styleUrl: './a31-costo-estimado-dialogo.css',
  templateUrl: './a31-costo-estimado-dialogo.html',
})
export class A31CostoEstimadoDialogo {
  datos: DatosCostoEstimado = inject(MAT_DIALOG_DATA);
  mesesCortos = [
    'ENE',
    'FEB',
    'MAR',
    'ABR',
    'MAY',
    'JUN',
    'JUL',
    'AGO',
    'SET',
    'OCT',
    'NOV',
    'DIC',
  ];

  // Texto corto del mes: 6 -> 'JUN'.
  get mesTexto(): string {
    return this.mesesCortos[this.datos.mes - 1];
  }
}
