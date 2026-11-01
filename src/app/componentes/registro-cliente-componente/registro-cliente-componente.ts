import { Component, inject, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogClose } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink, MatDialogClose],
  selector: 'app-registro-cliente-componente',
  styleUrl: './registro-cliente-componente.css',
  templateUrl: './registro-cliente-componente.html',
})
export class RegistroClienteComponente {
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

    const contrasena = formulario.elements.namedItem('contrasena') as HTMLInputElement;
    const confirmacion = formulario.elements.namedItem('confirmar-contrasena') as HTMLInputElement;
    this.validarConfirmacion(contrasena, confirmacion);

    if (!formulario.reportValidity()) {
      return;
    }

    // Simulación de interfaz: no se guarda una cuenta ni se envían datos al backend.
    // Al conectar el registro real, abrir esta confirmación solo tras una respuesta exitosa.
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
