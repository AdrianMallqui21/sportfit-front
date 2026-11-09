import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { UsuarioModelo } from '../../modelos/usuario-modelo';
import { Router } from '@angular/router';


@Component({
  imports: [
    BarraLateral,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    CommonModule,
    MatIcon,
    MatButton,
    ReactiveFormsModule,
  ],
  selector: 'app-c17-perfil-cliente-componente',
  styleUrl: './c17-perfil-cliente-componente.css',
  templateUrl: './c17-perfil-cliente-componente.html',
})
export class C17PerfilClienteComponente {
  perfilForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  clienteServicio: ClienteServicio = inject(ClienteServicio);
  router = inject(Router);
  detector = inject(ChangeDetectorRef);
  error = '';
  idUsuario = 0;
  cargando: boolean = true;
  edicion: boolean = false;

  constructor() {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', Validators.required],
      telefono: ['', Validators.required],
      correo: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.cargaForm();
  }

  //cargamos los datos en el formulario
  cargaForm() {
    const correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));

    this.clienteServicio.obtenerUsuario(correo, idRol).subscribe({
      next: (data) => {
        // Obtenemos el ID del usuario
        this.idUsuario = data.idUsuario;

        // Cargamos los datos en el formulario
        this.perfilForm.patchValue({
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          telefono: data.telefono,
          correo: data.correo,
        });

        this.cargando = false;
        this.detector.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
      },
    });
  }

  protected onSubmit() {
    if (this.perfilForm.valid && this.idUsuario > 0 && !this.cargando) {
      let usuario = new UsuarioModelo();

      usuario.idUsuario = this.idUsuario;
      usuario.nombre = this.perfilForm.value.nombre;
      usuario.apellido = this.perfilForm.value.apellido;
      usuario.dni = this.perfilForm.value.dni;
      usuario.telefono = this.perfilForm.value.telefono;
      usuario.correo = this.perfilForm.value.correo;

      console.log('Datos leidos del formulario:', usuario);

      this.clienteServicio.actualizarPerfil(usuario).subscribe({
        next: (data) => {
          console.log('Datos actualizados:', data);
          alert('Perfil actualizado correctamente');
          this.detector.markForCheck();
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          alert('No se pudieron actualizar los datos');
        },
      });
    } else {
      this.perfilForm.markAllAsTouched();
      console.log('Formulario no valido');
    }
  }
}
