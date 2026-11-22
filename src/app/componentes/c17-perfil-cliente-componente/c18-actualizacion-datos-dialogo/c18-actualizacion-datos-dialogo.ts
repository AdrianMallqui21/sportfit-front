import { Component, inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';

@Component({
  imports: [MatDialogContent, MatDialogActions],
  selector: 'app-c18-actualizacion-datos-dialogo',
  styleUrl: './c18-actualizacion-datos-dialogo.css',
  templateUrl: './c18-actualizacion-datos-dialogo.html',
})
export class C18ActualizacionDatosDialogo {
  dialogRef = inject(MatDialogRef<C18ActualizacionDatosDialogo>);

  cerrar() {
    this.dialogRef.close();
  }
}
