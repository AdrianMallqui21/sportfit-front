import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DatosConfirmarEdicionReserva {
  canchaNombre?: string;
  fecha?: string;
  horario?: string;
}

@Component({
  selector: 'app-a20-confirmar-edicion-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogContent,
    MatDialogClose,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './a20-confirmar-edicion-dialogo.html',
  styleUrl: './a20-confirmar-edicion-dialogo.css'
})
export class A20ConfirmarEdicionDialogo {
  private readonly dialogRef = inject(MatDialogRef<A20ConfirmarEdicionDialogo>);
  readonly data: DatosConfirmarEdicionReserva | null = inject(MAT_DIALOG_DATA, { optional: true });

  confirmar(): void {
    this.dialogRef.close(true);
  }
}
