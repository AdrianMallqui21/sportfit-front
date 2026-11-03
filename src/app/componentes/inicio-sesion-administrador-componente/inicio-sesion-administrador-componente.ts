import { UsuarioServicio } from '../../servicios/usuario-servicio';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize, map, switchMap } from 'rxjs';
import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';

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
  private readonly fb = inject(FormBuilder);
  private readonly autorizacionServicio = inject(AutorizacionServicio);
  private readonly usuarioServicio = inject(UsuarioServicio);
  private readonly router = inject(Router);

  readonly mostrarContrasena = signal(false);
  readonly enviando = signal(false);
  readonly mensajeError = signal('');

  readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
    recordarme: [false],
  });

  onSubmit(): void {
    console.log('[Login administrador] Se envió el formulario.');
    if (this.enviando()) return;

    this.mensajeError.set('');

    if (this.formulario.invalid) {
      console.log('[Login administrador] Formulario inválido. Revisa los campos.');
      this.formulario.markAllAsTouched();
      return;
    }

    const { correo, contrasena, recordarme } = this.formulario.getRawValue();
    this.enviando.set(true);
    console.log('[Login administrador] Enviando POST /api/authenticate.');

    this.autorizacionServicio
      .iniciarSesion(correo, contrasena)
      .pipe(
        switchMap((respuesta) => {
          console.log('[Login administrador] El servidor respondió. Verificando rol.');
          if (!respuesta.roles?.includes('ROLE_ADMINISTRADOR')) {
            throw new Error('Esta cuenta no tiene acceso como administrador.');
          }
          if (!respuesta.jwt) throw new Error('El servidor no devolvió un token.');

          console.log('[Login administrador] Consultando perfil del administrador.');
          return this.usuarioServicio.obtenerPerfilAdministrador(respuesta.jwt).pipe(
            map((perfil) => ({ ...perfil, jwt: respuesta.jwt })),
          );
        }),
        finalize(() => this.enviando.set(false)),
      )
      .subscribe({
        next: (usuario) => {
          if (!Number.isInteger(usuario.idUsuario) || usuario.idUsuario <= 0) {
            this.mensajeError.set('El servidor no devolvió un perfil válido.');
            return;
          }
          const almacenamiento = recordarme ? localStorage : sessionStorage;
          const otro = recordarme ? sessionStorage : localStorage;
          almacenamiento.setItem('usuarioSesion', JSON.stringify(usuario));
          otro.removeItem('usuarioSesion');
          localStorage.removeItem('jwt');
          sessionStorage.removeItem('jwt');
          console.log('[Login administrador] Perfil y JWT guardados. Abriendo /perfil-administrador.');
          void this.router.navigate(['/perfil-administrador']);
        },
        error: (error) => {
          console.error('[Login administrador] Falló la autenticación. Estado HTTP:', error.status);
          this.mensajeError.set(
            error.status === 401 || error.status === 403
              ? 'Revisa tu correo y contraseña.'
              : error instanceof Error && !('status' in error)
                ? error.message
                : 'No se pudo iniciar sesión. Inténtalo nuevamente.',
          );
        },
      });
  }
}
