import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {AutorizacionServicio} from '../../servicios/autorizacion-servicio';
import {UsuarioModelo} from '../../modelos/usuario-modelo';
import {C3ConfirmarRegistroDialogo} from './c3-confirmar-registro-dialogo/c3-confirmar-registro-dialogo';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatInput, MatPrefix, MatSuffix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-c2-registro-cliente-componente',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatSuffix,
    MatFormField,
    MatPrefix,
    MatIcon,
    MatInput,
  ],
  templateUrl: './c2-registro-cliente-componente.html',
  styleUrl: './c2-registro-cliente-componente.css',
})
export class C2RegistroClienteComponente {
  ocultarContrasena = signal(true);
  ocultarConfirmacion = signal(true);
  private readonly fb = inject(FormBuilder);
  registroCliente = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    dni: ['', Validators.required],
    telefono: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
    confirmacion: ['', Validators.required],
  });
  private readonly autorizacion = inject(AutorizacionServicio);
  private readonly dialogo = inject(MatDialog);

  abrirDialogo() {
    this.dialogo.open(C3ConfirmarRegistroDialogo);
  }

  protected onSubmit() {
    if (this.registroCliente.invalid) {
      this.registroCliente.markAllAsTouched();
      return;
    }

    const valores = this.registroCliente.getRawValue();
    const usuario = new UsuarioModelo();
    usuario.nombre = valores.nombres!;
    usuario.apellido = valores.apellidos!;
    usuario.dni = valores.dni!;
    usuario.telefono = valores.telefono!;
    usuario.correo = valores.correo!;
    usuario.contrasenaHash = valores.contrasena!;
    usuario.imgUsuario = "http://adriantupapi.com"
    

    this.autorizacion.registroCliente(usuario).subscribe({
      next: () => this.abrirDialogo(),
      error: error => {
        console.error('Error al registrar cliente:', error);
        alert('No se pudo completar el registro.');
      },
    });
  }
}
