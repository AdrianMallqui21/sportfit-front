import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatDialogClose} from '@angular/material/dialog';

@Component({
  imports: [
    MatButton,
    RouterLink,
    MatIcon,
    MatDialogClose
  ],
  selector: 'app-c3-confirmar-registro-dialogo',
  styleUrl: './c3-confirmar-registro-dialogo.css',
  templateUrl: './c3-confirmar-registro-dialogo.html',
})
export class C3ConfirmarRegistroDialogo {

}
