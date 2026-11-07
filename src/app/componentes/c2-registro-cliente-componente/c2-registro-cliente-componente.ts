import {Component, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';
import {C3ConfirmarRegistroDialogo} from './c3-confirmar-registro-dialogo/c3-confirmar-registro-dialogo';

@Component({
  selector: 'app-c2-registro-cliente-componente',
  imports: [RouterLink, MatButton, MatIconButton, MatSuffix, MatFormField, MatPrefix, MatIcon, MatInput],
  templateUrl: './c2-registro-cliente-componente.html',
  styleUrl: './c2-registro-cliente-componente.css',
})
export class C2RegistroClienteComponente {
  dialogo = inject(MatDialog);

  ocultarContrasena = signal(true);
  ocultarConfirmacion = signal(true);

  abrirDialogo() {
    const dialogoRef = this.dialogo.open(C3ConfirmarRegistroDialogo);
  }

}
