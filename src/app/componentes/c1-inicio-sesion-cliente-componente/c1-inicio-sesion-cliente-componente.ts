import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {email, form, FormField, required} from '@angular/forms/signals';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {RouterLink} from '@angular/router';
import {MatCheckbox} from '@angular/material/checkbox';

@Component({
  selector: 'app-c1-inicio-sesion-cliente-componente',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormField,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatButton,
    MatIconButton,
    MatIcon,
    MatSuffix,
    MatCheckbox,
  ],
  templateUrl: './c1-inicio-sesion-cliente-componente.html',
  styleUrl: './c1-inicio-sesion-cliente-componente.css',
})
export class C1InicioSesionClienteComponente {
  hide = signal(true);
  protected loginCliente: FormGroup;
  protected email = form(signal(''), p => {
    required(p, {message: 'You must enter a value'});
    email(p, {message: 'Not a valid email'});
  });
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.loginCliente = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  protected onSubmit() {
  }
}
