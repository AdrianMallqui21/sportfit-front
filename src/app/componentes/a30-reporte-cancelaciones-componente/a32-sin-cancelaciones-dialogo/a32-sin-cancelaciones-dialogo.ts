import { Component } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose } from '@angular/material/dialog';

// Aviso que aparece cuando el período elegido no tiene reservas canceladas.
@Component({
  imports: [MatIconButton, MatIcon, MatDialogClose],
  selector: 'app-a32-sin-cancelaciones-dialogo',
  styleUrl: './a32-sin-cancelaciones-dialogo.css',
  templateUrl: './a32-sin-cancelaciones-dialogo.html',
})
export class A32SinCancelacionesDialogo {}
