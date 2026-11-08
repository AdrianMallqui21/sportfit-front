import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatInput, MatPrefix, MatSuffix} from '@angular/material/input';
import {Router, RouterLink} from '@angular/router';
import {MatCheckbox} from '@angular/material/checkbox';
import {AutorizacionServicio} from '../../servicios/autorizacion-servicio';
import {CredencialesDTOModelo} from '../../modelos/credenciales-dto-modelo';
import {RespuestaDTOModelo} from '../../modelos/respuesta-dto-modelo';
import {ClienteServicio} from '../../servicios/cliente-servicio';
import {map, Observable} from 'rxjs';
import {UsuarioModelo} from '../../modelos/usuario-modelo';

@Component({
  selector: 'app-a1-inicio-sesion-administrador-componente',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormField,
    MatPrefix,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatSuffix,
    MatCheckbox,
  ],
  templateUrl: './a1-inicio-sesion-administrador-componente.html',
  styleUrl: './a1-inicio-sesion-administrador-componente.css',
})
export class A1InicioSesionAdministradorComponente {
  hide = signal(true);
  correo: string = '';
  contrsena: string = '';
  router: Router = inject(Router);
  // Logica de auth
  autorizacionServicio: AutorizacionServicio = inject(AutorizacionServicio);
  clienteServicio: ClienteServicio = inject(ClienteServicio);
  protected loginAdministrador: FormGroup;


  private readonly fb = inject(FormBuilder);

  constructor() {
    this.loginAdministrador = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  ngOnInit() {
    if (localStorage.getItem('token') != null) {
      localStorage.clear();
      console.log("Token e items eliminados")
    }
    this.loadForm()
  }

  loadForm(): void {
    console.log("Cargando formulario");
  }

  cargarAdministrador(emailBuscado: string): Observable<UsuarioModelo> {
    return this.clienteServicio.obtenerAdministradorCorreo(emailBuscado).pipe(
      map(usuario => usuario)
    )
  }

  protected onSubmit() {
    if (this.loginAdministrador.valid) {
      const credenciales: CredencialesDTOModelo = new CredencialesDTOModelo();
      credenciales.correo = this.loginAdministrador.value.email;
      credenciales.password = this.loginAdministrador.value.password;
      this.autorizacionServicio.accederCliente(credenciales).subscribe({
        next: (data: RespuestaDTOModelo) => {
          if (!data.roles?.includes('ROLE_ADMINISTRADOR')) {
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            alert('Este acceso es solo para administradores. Usa la opción Usuario.');
            return;
          }
          localStorage.setItem('rol', 'ROLE_ADMINISTRADOR');
          //PASAR
          this.cargarAdministrador(credenciales.correo).subscribe({
            next: (usuario) => {
              console.log("Usuario enviado: ", usuario);
              this.router.navigate(['/perfil-administrador'], {state: {usuario}});
            },
            error: () => alert('No se pudo obtener el ID del administrador')
          });
        },
        error: (error) => {
          console.error('Error al iniciar sesión:', error);
          alert('No se pudo iniciar sesión');
        }
      });
    } else {
      alert("Formulario no valido!")
      console.log("Formulario no valido");
    }
  }

}
