import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { UsuarioModelo } from '../../modelos/usuario-modelo';
import { Router } from '@angular/router';
import { ReservaHome } from '../../modelos/home-cliente-modelo';


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
    MatPrefix,
  ],
  selector: 'app-c17-perfil-cliente-componente',
  styleUrl: './c17-perfil-cliente-componente.css',
  templateUrl: './c17-perfil-cliente-componente.html',
})
export class C17PerfilClienteComponente implements OnInit {
  // =====================================
  // INYECCIÓN DE DEPENDENCIAS
  // =====================================

  perfilForm: FormGroup;

  fb: FormBuilder = inject(FormBuilder);
  clienteServicio: ClienteServicio = inject(ClienteServicio);
  router = inject(Router);
  detector = inject(ChangeDetectorRef);

  // =====================================
  // VARIABLES DEL PERFIL
  // =====================================

  error = '';
  idUsuario = 0;

  cargando: boolean = true;
  edicion: boolean = false;

  // Almacena todos los datos originales del usuario
  usuario: UsuarioModelo = new UsuarioModelo();

  // Datos completos para mostrar el resumen del perfil
  usuarioActual: UsuarioModelo | null = null;

  // =====================================
  // VARIABLES DE RESERVAS
  // =====================================

  reservas: ReservaHome[] = [];
  reservasRecientes: ReservaHome[] = [];

  cargandoReservas = false;
  errorReservas = '';

  // =====================================
  // CONSTRUCTOR Y FORMULARIO
  // =====================================

  constructor() {
    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],

      apellido: ['', Validators.required],

      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],

      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],

      correo: ['', [Validators.required, Validators.email]],
    });
  }

  // =====================================
  // INICIALIZACIÓN
  // =====================================

  ngOnInit() {
    this.cargaForm();
  }

  // =====================================
  // CARGAR DATOS DEL CLIENTE
  // =====================================

  cargaForm() {
    const correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));

    this.clienteServicio.obtenerUsuario(correo, idRol).subscribe({
      next: (data) => {
        // Obtenemos el ID del usuario
        this.usuario = data;
        this.usuarioActual = data;
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

        // Cargamos las reservas del cliente
        this.cargarReservas(data.idUsuario);

        this.detector.markForCheck();
      },

      error: (error) => {
        console.error('Error al cargar usuario:', error);

        this.error = 'No se pudieron cargar los datos del cliente.';

        this.cargando = false;

        this.detector.markForCheck();
      },
    });
  }

  // =====================================
  // ACTUALIZAR PERFIL
  // =====================================

  protected onSubmit() {
    if (this.perfilForm.valid && this.idUsuario > 0 && !this.cargando) {
      // Creamos una copia del usuario original
      let usuario = { ...this.usuario };

      // Actualizamos los campos ingresados en el formulario
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

          // Actualizamos los datos del usuario en memoria
          this.usuario = { ...usuario } as UsuarioModelo;
          this.usuarioActual = this.usuario;

          // Marcamos el formulario como actualizado
          this.perfilForm.markAsPristine();

          alert('Perfil actualizado correctamente');

          this.detector.markForCheck();
        },

        error: (error) => {
          console.error('Error al actualizar:', error);

          alert('No se pudieron actualizar los datos');

          this.detector.markForCheck();
        },
      });
    } else {
      this.perfilForm.markAllAsTouched();

      console.log('Formulario no valido');
    }
  }

  // =====================================
  // CARGAR RESERVAS DEL CLIENTE
  // =====================================

  cargarReservas(idUsuario: number) {
    this.cargandoReservas = true;
    this.errorReservas = '';

    this.clienteServicio.obtenerReservas(idUsuario).subscribe({
      next: (data) => {
        // Guardamos todas las reservas obtenidas
        this.reservas = data || [];

        // Ordenamos por ID de reserva descendente
        // y seleccionamos las últimas tres
        this.reservasRecientes = [...this.reservas]
          .sort((a, b) => b.idReserva - a.idReserva)
          .slice(0, 3);

        this.cargandoReservas = false;

        this.detector.markForCheck();
      },

      error: (error) => {
        console.error('Error al cargar reservas:', error);

        this.errorReservas = 'No se pudo cargar la actividad reciente.';

        this.cargandoReservas = false;

        this.detector.markForCheck();
      },
    });
  }

  // =====================================
  // IDENTIFICAR TIPO DE ACTIVIDAD
  // =====================================

  tituloActividad(estado: string): string {
    const valor = (estado || '').toLowerCase();

    if (valor.includes('cancel')) {
      return 'Canceló una reserva';
    }

    if (valor.includes('complet')) {
      return 'Nueva reserva realizada';
    }

    if (valor.includes('confirm')) {
      return 'Reserva confirmada';
    }

    if (valor.includes('rechaz')) {
      return 'Reserva rechazada';
    }

    return 'Nueva reserva solicitada';
  }

  // =====================================
  // ASIGNAR COLOR SEGÚN ESTADO
  // =====================================

  claseActividad(estado: string): string {
    const valor = (estado || '').toLowerCase();

    if (valor.includes('cancel') || valor.includes('rechaz')) {
      return 'actividad-roja';
    }

    if (valor.includes('confirm') || valor.includes('complet')) {
      return 'actividad-verde';
    }

    return 'actividad-amarilla';
  }
}
