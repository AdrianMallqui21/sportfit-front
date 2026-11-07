import {Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatPrefix, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';

@Component({
  selector: 'app-a1-inicio-sesion-administrador-componente',
  imports: [
    RouterLink,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatFormField,
    MatPrefix,
    MatSuffix,
    MatIcon,
    MatInput,
  ],
  templateUrl: './a1-inicio-sesion-administrador-componente.html',
  styleUrl: './a1-inicio-sesion-administrador-componente.css',
})
export class A1InicioSesionAdministradorComponente {
  hide = signal(true);
}