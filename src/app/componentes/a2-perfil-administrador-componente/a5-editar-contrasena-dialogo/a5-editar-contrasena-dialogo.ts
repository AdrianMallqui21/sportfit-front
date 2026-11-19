import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {A6ConfirmarContrasenaDialogo} from '../a6-confirmar-contrasena-dialogo/a6-confirmar-contrasena-dialogo';
import {AdministradorServicio} from '../../../servicios/administrador-servicio';
import {UsuarioModelo} from '../../../modelos/usuario-modelo';

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatIcon,
    MatDialogClose
  ],
  selector: 'app-a5-editar-contrasena-dialogo',
  styleUrl: './a5-editar-contrasena-dialogo.css',
  templateUrl: './a5-editar-contrasena-dialogo.html',
})
export class A5EditarContrasenaDialogo {
  contrasenaForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  hide = signal(true);
  hideConfirmacion = signal(true);
  administradorServicio = inject(AdministradorServicio);
  usuario: UsuarioModelo;
  private dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<A5EditarContrasenaDialogo>);
  private datos: UsuarioModelo = inject(MAT_DIALOG_DATA);

  constructor() {
    this.contrasenaForm = this.fb.group({
      contrasena: ['', Validators.required],
      contrasenaConfirmar: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.usuario = this.datos;
    console.log(this.usuario);
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  abrirDialogoConfirmar(): void {
    this.dialog.open(A6ConfirmarContrasenaDialogo, {
      width: '360px',
      maxWidth: '95vw'
    });
  }

  protected onSubmit(): void {
    if (this.contrasenaForm.invalid) {
      this.contrasenaForm.markAllAsTouched();
      alert('Completa los campos.');
      return;
    }

    const {contrasena, contrasenaConfirmar} = this.contrasenaForm.getRawValue();

    if (contrasena !== contrasenaConfirmar) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.administradorServicio
      .actualizarContraseña(contrasena, this.usuario.idUsuario)
      .subscribe({
        next: (usuarioActualizado) => {
          this.dialogRef.afterClosed().subscribe(() => {
            this.abrirDialogoConfirmar();
          });

          this.dialogRef.close(usuarioActualizado);
        },
        error: () => {
          alert('No se pudo actualizar la contraseña.');
        }
      });
  }


}
