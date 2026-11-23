import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose } from '@angular/material/dialog';

@Component({
  imports: [MatButton, MatIcon, MatDialogClose],
  selector: 'app-c15-reserva-cancelada-dialogo',
  styleUrl: './c15-reserva-cancelada-dialogo.css',
  templateUrl: './c15-reserva-cancelada-dialogo.html',
})
export class C15ReservaCanceladaDialogo {}
