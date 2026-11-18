import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';

@Component({
  imports: [MatButton, MatIcon, MatDialogClose],
  selector: 'app-c16-imposible-cancelar-dialogo',
  styleUrl: './c16-imposible-cancelar-dialogo.css',
  templateUrl: './c16-imposible-cancelar-dialogo.html',
})
export class C16ImposibleCancelarDialogo {
  protected estado: string = inject(MAT_DIALOG_DATA);
}
