import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { UsuarioModelo } from '../../modelos/usuario-modelo';
import { Router } from '@angular/router';
import { ReservaHome } from '../../modelos/home-cliente-modelo';
import { MatDialog } from '@angular/material/dialog';
import { C18ActualizacionDatosDialogo } from './c18-actualizacion-datos-dialogo/c18-actualizacion-datos-dialogo';
import { A7CambiarFotoDialogo } from '../a2-perfil-administrador-componente/a7-cambiar-foto-dialogo/a7-cambiar-foto-dialogo';


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
    MatSuffix,
    MatIconButton,
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
  dialog = inject(MatDialog);

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
  mostrarContrasena = false;

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
      contrasenaHash: ['', Validators.minLength(8)],
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
      let usuario = { ...this.usuario };

      usuario.idUsuario = this.idUsuario;
      usuario.nombre = this.perfilForm.value.nombre;
      usuario.apellido = this.perfilForm.value.apellido;
      usuario.dni = this.perfilForm.value.dni;
      usuario.telefono = this.perfilForm.value.telefono;
      usuario.correo = this.perfilForm.value.correo;
      usuario.contrasenaHash = this.perfilForm.value.contrasenaHash || '';

      this.clienteServicio.actualizarPerfil(usuario).subscribe({
        next: (data) => {
          this.usuario = data;
          this.usuarioActual = data;

          localStorage.setItem('correo', data.correo);

          this.perfilForm.patchValue({
            contrasenaHash: '',
          });

          this.perfilForm.markAsPristine();
          this.mostrarContrasena = false;

          this.dialog.open(C18ActualizacionDatosDialogo, {
            width: '360px',
            maxWidth: '90vw',
            disableClose: true,
          });

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
    }
  }

  abrirDialogoCambiarFoto(): void {
    if (!this.usuarioActual) return;

    const idRolCliente = this.usuarioActual.idRol ?? (Number(localStorage.getItem('idRol')) || 1);
    this.dialog.open(A7CambiarFotoDialogo, {
      width: '460px',
      maxWidth: '95vw',
      data: { ...this.usuarioActual, idRol: idRolCliente }
    }).afterClosed().subscribe((usuarioActualizado?: UsuarioModelo) => {
      if (usuarioActualizado) {
        this.usuario = usuarioActualizado;
        this.usuarioActual = usuarioActualizado;
        this.detector.markForCheck();
      }
    });
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

  seleccionarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      alert('Seleccione una imagen JPG, PNG o WEBP');
      return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
      alert('La imagen no debe superar los 2 MB');
      return;
    }

    this.clienteServicio.subirFoto(archivo).subscribe({
      next: (data) => {
        this.usuarioActual = data;
        this.usuario = data;
        alert('Foto actualizada correctamente');
        this.detector.markForCheck();
      },
      error: () => {
        alert('No se pudo actualizar la fotografía');
      },
    });

    input.value = '';
  }
}
