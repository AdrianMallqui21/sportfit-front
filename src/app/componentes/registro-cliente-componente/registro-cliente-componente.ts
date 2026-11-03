import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';
import { finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Component, inject, signal, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, RouterLink, MatDialogClose],
  selector: 'app-registro-cliente-componente',
  styleUrl: './registro-cliente-componente.css',
  templateUrl: './registro-cliente-componente.html',
})
export class RegistroClienteComponente {
  readonly mostrarContrasena = signal(false);
  readonly mostrarConfirmacion = signal(false);

  readonly enviando = signal(false);
  readonly errorRegistro = signal('');
  private readonly autorizacion = inject(AutorizacionServicio);

  private readonly dialogo = inject(MatDialog);
  private readonly enrutador = inject(Router);

  validarConfirmacion(
    contrasena: HTMLInputElement,
    confirmacion: HTMLInputElement,
  ): void {
    const noCoinciden = confirmacion.value !== '' && contrasena.value !== confirmacion.value;
    confirmacion.setCustomValidity(noCoinciden ? 'Las contraseñas deben coincidir.' : '');
  }

  registrarCliente(
    evento: SubmitEvent,
    formulario: HTMLFormElement,
    confirmacionRegistro: TemplateRef<unknown>,
  ): void {
    evento.preventDefault();
    if (this.enviando()) return;
    this.errorRegistro.set('');

    const contrasena = formulario.elements.namedItem('contrasena') as HTMLInputElement;
    const confirmacion = formulario.elements.namedItem('confirmar-contrasena') as HTMLInputElement;
    this.validarConfirmacion(contrasena, confirmacion);

    if (!formulario.reportValidity()) {
      return;
    }

    const datos = new FormData(formulario);
    this.enviando.set(true);
    this.autorizacion.registrarCliente({
      nombre: String(datos.get('nombres')).trim(),
      apellido: String(datos.get('apellidos')).trim(),
      dni: String(datos.get('dni')).trim(),
      telefono: String(datos.get('telefono')).trim(),
      correo: String(datos.get('correo')).trim(),
      contrasenaHash: contrasena.value,
    }).pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: () => {
        formulario.reset();
        this.mostrarContrasena.set(false);
        this.mostrarConfirmacion.set(false);
        this.confirmarRegistro(confirmacionRegistro);
      },
      error: (error) => {
        this.errorRegistro.set(error.status === 0
          ? 'No se pudo conectar con el servidor.'
          : 'No se pudo crear la cuenta. Revisa tus datos e inténtalo nuevamente.');
      },
    });
  }

  private confirmarRegistro(confirmacionRegistro: TemplateRef<unknown>): void {
    const referenciaDialogo = this.dialogo.open(confirmacionRegistro, {
      width: '440px',
      maxWidth: 'calc(100vw - 32px)',
      ariaLabelledBy: 'titulo-confirmacion-registro',
      ariaDescribedBy: 'descripcion-confirmacion-registro',
      autoFocus: 'first-tabbable',
    });

    referenciaDialogo.afterClosed().subscribe((resultado) => {
      if (resultado === 'iniciar-sesion') {
        void this.enrutador.navigateByUrl('/');
      }
    });
  }
}
