import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-inicio-sesion-administrador-componente',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './inicio-sesion-administrador-componente.html',
  styleUrl: './inicio-sesion-administrador-componente.css',
})
export class InicioSesionAdministradorComponente {
  readonly mostrarContrasena = signal(false);

  private readonly fb = inject(FormBuilder);

  readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
    recordarme: [false],
  });

  onSubmit(): void {
    this.formulario.markAllAsTouched();
  }
}
