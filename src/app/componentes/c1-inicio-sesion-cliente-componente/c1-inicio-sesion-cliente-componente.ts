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

@Component({
  selector: 'app-c1-inicio-sesion-cliente-componente',
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
  templateUrl: './c1-inicio-sesion-cliente-componente.html',
  styleUrl: './c1-inicio-sesion-cliente-componente.css',
})
export class C1InicioSesionClienteComponente {
  hide = signal(true);
  correo: string = '';
  contrsena: string = '';
  router: Router = inject(Router);
  // Logica de auth
  autorizacionServicio: AutorizacionServicio = inject(AutorizacionServicio);
  protected loginCliente: FormGroup;


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

  protected onSubmit() {
    if (this.loginCliente.valid) {
      const credenciales: CredencialesDTOModelo = new CredencialesDTOModelo();
      credenciales.correo = this.loginCliente.value.email;
      credenciales.password = this.loginCliente.value.password;
      let respuestaDTO: RespuestaDTOModelo = new RespuestaDTOModelo();
      this.autorizacionServicio.accederCliente(credenciales).subscribe({
        next: (data: RespuestaDTOModelo) => {
          if (!data.roles?.includes('ROLE_CLIENTE')) {
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            alert('Este acceso es solo para clientes. Usa la opción Administrador.');
            return;
          }
          localStorage.setItem('rol', 'ROLE_CLIENTE');
          this.router.navigate(['/home']);
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
