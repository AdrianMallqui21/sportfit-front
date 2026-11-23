import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose } from '@angular/material/dialog';

// Aviso que aparece al elegir una celda roja o cuando el back responde 409 (horario ya tomado).
@Component({
  imports: [MatButton, MatIcon, MatDialogClose],
  selector: 'app-c10-reserva-no-disponible-dialogo',
  styleUrl: './c10-reserva-no-disponible-dialogo.css',
  templateUrl: './c10-reserva-no-disponible-dialogo.html',
})
export class C10ReservaNoDisponibleDialogo {}
