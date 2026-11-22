import {ChangeDetectorRef, Component, inject} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {ActivatedRoute} from '@angular/router';
import {UsuarioModelo} from '../../modelos/usuario-modelo';
import {DatePipe} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {A3PerfilActualizarDialogo} from './a3-perfil-actualizar-dialogo/a3-perfil-actualizar-dialogo';
import {A5EditarContrasenaDialogo} from './a5-editar-contrasena-dialogo/a5-editar-contrasena-dialogo';

@Component({
  imports: [MatCardModule, MatButtonModule, DatePipe],
  selector: 'app-a2-perfil-administrador-componente',
  styleUrl: './a2-perfil-administrador-componente.css',
  templateUrl: './a2-perfil-administrador-componente.html',
})
export class A2PerfilAdministradorComponente {
  route: ActivatedRoute = inject(ActivatedRoute);
  idAdmin: number;
  usuario: UsuarioModelo = new UsuarioModelo();
  rol = localStorage.getItem('rol');
  ultimoAcceso: Date = new Date();
  sesioneActivas = 1
  private dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.usuario = history.state.usuario ?? null;
    if (this.usuario) {
      //console.log("Usuario recibido:", this.usuario);
      console.log("Usuario Recibido")

    } else {
      console.log("Error al cargar usuario");
    }
  }

  abrirDialogoEditar(): void {
    this.dialog.open(A3PerfilActualizarDialogo, {
      width: '520px',
      maxWidth: '95vw',
      data: this.usuario
    }).afterClosed().subscribe((usuarioActualizado?: UsuarioModelo) => {
      if (usuarioActualizado) {
        this.usuario = usuarioActualizado;
        this.cdr.detectChanges();
      }
    });
  }

  abrirDialogoContrasena(): void {
    this.dialog.open(A5EditarContrasenaDialogo, {
      width: '520px',
      maxWidth: '95vw',
      data: this.usuario
    }).afterClosed().subscribe((usuarioActualizado?: UsuarioModelo) => {
      if (usuarioActualizado) {
        this.usuario = usuarioActualizado;
      }
    });
  }


  // Cargar información de administrador

  // Cambiar información de administrador


}
