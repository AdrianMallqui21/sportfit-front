import {ChangeDetectorRef, Component, OnInit, inject} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {ActivatedRoute} from '@angular/router';
import {UsuarioModelo} from '../../modelos/usuario-modelo';
import {DatePipe} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {AdministradorServicio} from '../../servicios/administrador-servicio';
import {A3PerfilActualizarDialogo} from './a3-perfil-actualizar-dialogo/a3-perfil-actualizar-dialogo';
import {A5EditarContrasenaDialogo} from './a5-editar-contrasena-dialogo/a5-editar-contrasena-dialogo';
import {A7CambiarFotoDialogo} from './a7-cambiar-foto-dialogo/a7-cambiar-foto-dialogo';

@Component({
  imports: [MatCardModule, MatButtonModule, DatePipe],
  selector: 'app-a2-perfil-administrador-componente',
  styleUrl: './a2-perfil-administrador-componente.css',
  templateUrl: './a2-perfil-administrador-componente.html',
})
export class A2PerfilAdministradorComponente implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  idAdmin: number;
  usuario: UsuarioModelo = new UsuarioModelo();
  rol = localStorage.getItem('rol');
  ultimoAcceso: Date = new Date();
  sesioneActivas = 1;
  private dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly administradorServicio = inject(AdministradorServicio);

  ngOnInit(): void {
    const stateUsuario = history.state?.usuario as UsuarioModelo | undefined;
    if (stateUsuario && stateUsuario.correo) {
      this.usuario = stateUsuario;
      localStorage.setItem('correo', stateUsuario.correo);
      return;
    }

    const correo =
      localStorage.getItem('correo') ||
      localStorage.getItem('correoAdministrador') ||
      this.obtenerCorreoDesdeToken();

    if (correo) {
      this.administradorServicio.obtenerAdministradorCorreo(correo, 2).subscribe({
        next: (admin) => {
          this.usuario = admin;
          this.cdr.detectChanges();
        },
        error: () => {
          console.log('Error al cargar usuario');
        }
      });
    }
  }

  private obtenerCorreoDesdeToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.sub || '';
    } catch {
      return '';
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

  abrirDialogoCambiarFoto(): void {
    this.dialog.open(A7CambiarFotoDialogo, {
      width: '460px',
      maxWidth: '95vw',
      data: this.usuario
    }).afterClosed().subscribe((usuarioActualizado?: UsuarioModelo) => {
      if (usuarioActualizado) {
        this.usuario = usuarioActualizado;
        this.cdr.detectChanges();
      }
    });
  }
}
