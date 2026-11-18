import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {UsuarioModelo} from '../../../modelos/usuario-modelo';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AdministradorServicio} from '../../../servicios/administrador-servicio';
import {A4ConfirmarActualizarDialogo} from '../a4-confirmar-actualizar-dialogo/a4-confirmar-actualizar-dialogo';

@Component({
  imports: [
    MatDialogTitle,
    MatIcon,
    MatDialogClose,
    MatIconButton,
    MatDialogContent,
    MatInput,
    MatDialogActions,
    MatButton,
    ReactiveFormsModule
  ],
  selector: 'app-a3-perfil-actualizar-dialogo',
  styleUrl: './a3-perfil-actualizar-dialogo.css',
  templateUrl: './a3-perfil-actualizar-dialogo.html',
})
export class A3PerfilActualizarDialogo {
  usuario: UsuarioModelo = new UsuarioModelo();
  usuarioForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  //Tocar esto
  administradorServicio = inject(AdministradorServicio);
  private datos: UsuarioModelo = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef);
  private dialog = inject(MatDialog);

  constructor() {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]],
      telefono: ['', Validators.required],
      correo: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  ngOnInit(): void {
    this.usuario = this.datos;
    this.cargaForm();
  }

// Coloca los datos recibidos en los campos del formulario
  cargaForm(): void {
    this.usuarioForm.patchValue({
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellido,
      dni: this.usuario.dni,
      telefono: this.usuario.telefono,
      correo: this.usuario.correo
    });
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    // Crea una copia con los datos editados
    const usuarioEditado = Object.assign(
      new UsuarioModelo(),
      this.usuario,
      this.usuarioForm.value
    );

    this.administradorServicio.actualizarAdministrador(usuarioEditado)
      .subscribe({
        next: (usuarioActualizado) => {
          // Espera a que termine de cerrarse A3 para abrir A4
          this.dialogRef.afterClosed().subscribe(() => {
            this.abrirDialogoConfirmar();
          });

          // Cierra A3 y devuelve el usuario actualizado a la vista anterior
          this.dialogRef.close(usuarioActualizado);
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
        }
      });
  }

  abrirDialogoConfirmar(): void {
    this.dialog.open(A4ConfirmarActualizarDialogo, {
      width: '360px',
      maxWidth: '95vw'
    });
  }

}
