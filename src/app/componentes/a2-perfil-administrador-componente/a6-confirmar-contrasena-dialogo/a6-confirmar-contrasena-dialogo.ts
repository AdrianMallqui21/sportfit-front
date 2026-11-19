import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon
  ],
  selector: 'app-a6-confirmar-contrasena-dialogo',
  styleUrl: './a6-confirmar-contrasena-dialogo.css',
  templateUrl: './a6-confirmar-contrasena-dialogo.html',
})
export class A6ConfirmarContrasenaDialogo {
  private dialogRef = inject(MatDialogRef<A6ConfirmarContrasenaDialogo>);
  

  // Cierra el diálogo al pulsar ENTENDIDO
  cerrar(): void {
    this.dialogRef.close();
  }

}
