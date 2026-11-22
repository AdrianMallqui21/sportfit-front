import {Component, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

class A4PerfilConfirmacionDialogo {
}

@Component({
  imports: [
    MatIcon,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton
  ],
  selector: 'app-a4-confirmar-actualizar-dialogo',
  styleUrl: './a4-confirmar-actualizar-dialogo.css',
  templateUrl: './a4-confirmar-actualizar-dialogo.html',
})
export class A4ConfirmarActualizarDialogo {
  private dialogRef = inject(MatDialogRef<A4PerfilConfirmacionDialogo>);

  // Cierra el diálogo al pulsar ENTENDIDO
  cerrar(): void {
    this.dialogRef.close();
  }
}
