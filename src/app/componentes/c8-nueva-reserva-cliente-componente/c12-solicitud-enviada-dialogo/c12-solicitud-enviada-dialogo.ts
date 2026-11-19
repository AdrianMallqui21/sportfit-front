import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialogClose } from '@angular/material/dialog';

// Confirmación que aparece después de enviar la solicitud de reserva correctamente.
@Component({
  imports: [MatButton, MatIcon, MatDialogClose],
  selector: 'app-c12-solicitud-enviada-dialogo',
  styleUrl: './c12-solicitud-enviada-dialogo.css',
  templateUrl: './c12-solicitud-enviada-dialogo.html',
})
export class C12SolicitudEnviadaDialogo {}
