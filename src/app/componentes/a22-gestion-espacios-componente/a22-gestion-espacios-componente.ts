import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { SedeCanchaModelo, SedeModelo, TipoCanchaModelo } from '../../modelos/espacio-deportivo-modelo';
import { ReservaModelo } from '../../modelos/solicitud-reserva-modelo';
import { EspacioDeportivoServicio } from '../../servicios/espacio-deportivo-servicio';
import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';
import { CredencialesDTOModelo } from '../../modelos/credenciales-dto-modelo';

@Component({
  selector: 'app-a22-gestion-espacios-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './a22-gestion-espacios-componente.html',
  styleUrl: './a22-gestion-espacios-componente.css'
})
export class A22GestionEspaciosComponente implements OnInit {
  private readonly espacioServicio = inject(EspacioDeportivoServicio);
  private readonly authServicio = inject(AutorizacionServicio);
  private readonly fb = inject(FormBuilder);

  // Estados de datos
  canchas = signal<SedeCanchaModelo[]>([]);
  canchasFiltradas = signal<SedeCanchaModelo[]>([]);
  sedes = signal<SedeModelo[]>([]);
  cargando = signal<boolean>(false);
  alertaAutenticacion = signal<boolean>(false);
  iniciandoSesionRapida = signal<boolean>(false);

  // Filtros de búsqueda (Vista a22)
  filtroEstado = '';
  filtroSede = '';
  filtroDeporte = '';

  readonly opcionesEstado = [
    { valor: '', etiqueta: 'Todos' },
    { valor: 'true', etiqueta: 'Activo' },
    { valor: 'false', etiqueta: 'Desactivado' }
  ];

  readonly opcionesDeporte = [
    { valor: '', etiqueta: 'Ingrese el deporte' },
    { valor: 'FUTBOL', etiqueta: 'Fútbol' },
    { valor: 'FUTSAL', etiqueta: 'Futsal' },
    { valor: 'BASKET', etiqueta: 'Básquet' },
    { valor: 'TENIS', etiqueta: 'Tenis' },
    { valor: 'VOLEY', etiqueta: 'Vóley' }
  ];

  readonly opcionesAforo = [4, 8, 10, 12, 14, 16, 18, 22];

  // Modales
  modalEditarAbierto = false;                // Vista a23
  modalDesactivarAbierto = false;            // Vista a24
  modalConfirmacionDesactivadoAbierto = false; // Vista a25
  modalReservasAbierto = false;              // Ver Reservas (ED67)

  // Espacio seleccionado
  canchaSeleccionada = signal<SedeCanchaModelo | null>(null);
  reservasCancha = signal<ReservaModelo[]>([]);
  cargandoReservas = signal<boolean>(false);

  // Formulario Reactivo para Edición (Vista a23 - Estándar del profesor)
  formEdicion: FormGroup;

  constructor() {
    this.formEdicion = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      deporte: ['FUTBOL', Validators.required],
      aforo: [10, [Validators.required, Validators.min(2)]],
      precio: [60, [Validators.required, Validators.min(10)]],
      imgCancha: ['']
    });
  }

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.alertaAutenticacion.set(true);
    }
    this.cargarSedes();
    this.cargarCanchas();
  }

  cargarSedes(): void {
    this.espacioServicio.listarSedes().subscribe({
      next: (data) => this.sedes.set(data || []),
      error: () => this.sedes.set([])
    });
  }

  cargarCanchas(): void {
    this.cargando.set(true);
    this.espacioServicio.list().subscribe({
      next: (data) => {
        const lista = data || [];
        this.canchas.set(lista);
        this.canchasFiltradas.set(lista);
        this.alertaAutenticacion.set(false);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          this.alertaAutenticacion.set(true);
        }
      }
    });
  }

  // --- FILTROS DE BÚSQUEDA ---
  aplicarFiltros(): void {
    let lista = this.canchas();

    // 1. Filtro Estado
    if (this.filtroEstado !== '') {
      const estadoBool = this.filtroEstado === 'true';
      lista = lista.filter(c => c.estado === estadoBool);
    }

    // 2. Filtro Sede
    if (this.filtroSede) {
      const idSedeNum = Number(this.filtroSede);
      lista = lista.filter(c => c.sede?.idSede === idSedeNum);
    }

    // 3. Filtro Deporte
    if (this.filtroDeporte) {
      const buscado = this.filtroDeporte.toUpperCase();
      lista = lista.filter(c => {
        const dep = (c.cancha?.deporte || '').toUpperCase();
        if (buscado === 'BASKET' || buscado === 'BASQUET') {
          return dep === 'BASKET' || dep === 'BASQUET';
        }
        return dep === buscado;
      });
    }

    this.canchasFiltradas.set(lista);
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroSede = '';
    this.filtroDeporte = '';
    this.canchasFiltradas.set(this.canchas());
  }

  // --- VISTA a23: EDICIÓN DE ESPACIOS (Formulario Reactivo) ---
  abrirModalEditar(cancha: SedeCanchaModelo): void {
    this.canchaSeleccionada.set(cancha);
    const depActual = cancha.cancha?.deporte?.toUpperCase() || 'FUTBOL';
    const deporteForm = (depActual === 'BASQUET') ? 'BASKET' : depActual;

    this.formEdicion.patchValue({
      nombre: cancha.nombre || '',
      deporte: deporteForm,
      aforo: cancha.cancha?.aforo || 10,
      precio: cancha.precio ? Number(cancha.precio) : 60,
      imgCancha: cancha.imgCancha || 'https://sportfit.com/imagenes/cancha-default.png'
    });
    this.modalEditarAbierto = true;
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
  }

  guardarEdicion(): void {
    if (this.formEdicion.invalid) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    const cancha = this.canchaSeleccionada();
    if (!cancha) return;

    const formVal = this.formEdicion.value;

    const mapaTipoCancha: Record<string, number> = {
      'FUTBOL': 1,
      'BASKET': 2,
      'BASQUET': 2,
      'VOLEY': 3,
      'TENIS': 4,
      'FUTSAL': 5
    };

    const idTipo = mapaTipoCancha[formVal.deporte.toUpperCase()] || cancha.cancha?.idTipoCancha || 1;

    const dtoActualizado: SedeCanchaModelo = {
      ...cancha,
      nombre: formVal.nombre.trim() || cancha.nombre,
      precio: Number(formVal.precio),
      estado: cancha.estado,
      imgCancha: formVal.imgCancha || cancha.imgCancha || 'https://sportfit.com/imagenes/cancha-default.png',
      sede: {
        idSede: cancha.sede?.idSede || 1,
        nombre: cancha.sede?.nombre || 'Sede Surco'
      },
      cancha: {
        idTipoCancha: idTipo,
        deporte: formVal.deporte.toUpperCase(),
        descripcion: cancha.cancha?.descripcion || 'Cancha deportiva con iluminación LED',
        aforo: Number(formVal.aforo)
      }
    };

    this.espacioServicio.update(dtoActualizado).subscribe({
      next: (resp) => {
        const actualizadas = this.canchas().map(item =>
          item.idSedeCancha === resp.idSedeCancha ? resp : item
        );
        this.canchas.set(actualizadas);
        this.aplicarFiltros();
        this.cerrarModalEditar();
      },
      error: (err: unknown) => {
        console.error('Error al actualizar cancha:', err);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'Error al comunicarse con el backend para actualizar el espacio.';
        alert(msg);
      }
    });
  }

  // --- VISTA a24: DESACTIVACIÓN DE ESPACIOS ---
  abrirModalDesactivar(cancha: SedeCanchaModelo): void {
    this.canchaSeleccionada.set(cancha);
    this.modalDesactivarAbierto = true;
  }

  cerrarModalDesactivar(): void {
    this.modalDesactivarAbierto = false;
  }

  confirmarDesactivacion(): void {
    const cancha = this.canchaSeleccionada();
    if (!cancha) return;

    this.espacioServicio.cambiarEstado(cancha.idSedeCancha, false).subscribe({
      next: (resp) => {
        const actualizadas = this.canchas().map(item =>
          item.idSedeCancha === resp.idSedeCancha ? { ...item, estado: false } : item
        );
        this.canchas.set(actualizadas);
        this.aplicarFiltros();
        this.modalDesactivarAbierto = false;
        // Abrir Vista a25
        this.modalConfirmacionDesactivadoAbierto = true;
      },
      error: (err: unknown) => {
        console.error('Error al desactivar cancha:', err);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'Error al comunicarse con el backend para desactivar el espacio.';
        alert(msg);
      }
    });
  }

  // --- VISTA a25: CONFIRMACIÓN DE DESACTIVACIÓN ---
  cerrarModalConfirmacion(): void {
    this.modalConfirmacionDesactivadoAbierto = false;
  }

  // --- REACTIVAR CANCHA ---
  reactivarCancha(cancha: SedeCanchaModelo): void {
    this.espacioServicio.cambiarEstado(cancha.idSedeCancha, true).subscribe({
      next: (resp) => {
        const actualizadas = this.canchas().map(item =>
          item.idSedeCancha === resp.idSedeCancha ? { ...item, estado: true } : item
        );
        this.canchas.set(actualizadas);
        this.aplicarFiltros();
      },
      error: (err: unknown) => {
        console.error('Error al reactivar cancha:', err);
        alert('Error al comunicarse con el backend para reactivar el espacio.');
      }
    });
  }

  // --- MODAL VER RESERVAS (ED67) ---
  abrirModalReservas(cancha: SedeCanchaModelo): void {
    this.canchaSeleccionada.set(cancha);
    this.cargandoReservas.set(true);
    this.reservasCancha.set([]);
    this.modalReservasAbierto = true;

    this.espacioServicio.listarReservasPorCancha(cancha.idSedeCancha).subscribe({
      next: (reservas) => {
        this.reservasCancha.set(reservas || []);
        this.cargandoReservas.set(false);
      },
      error: () => {
        this.reservasCancha.set([]);
        this.cargandoReservas.set(false);
      }
    });
  }

  cerrarModalReservas(): void {
    this.modalReservasAbierto = false;
  }

  // --- HELPERS VISUALES ---
  obtenerIconoDeporte(deporte?: string): string {
    const d = (deporte || '').toLowerCase();
    if (d.includes('tenis')) return 'sports_tennis';
    if (d.includes('basquet') || d.includes('básquet') || d.includes('basket')) return 'sports_basketball';
    if (d.includes('voley') || d.includes('voleibol')) return 'sports_volleyball';
    return 'sports_soccer';
  }

  formatearDeporte(deporte?: string): string {
    if (!deporte) return 'Fútbol';
    const dep = deporte.toLowerCase();
    if (dep === 'futbol') return 'Fútbol';
    if (dep === 'futsal') return 'Futsal';
    if (dep === 'basquet') return 'Básquet';
    if (dep === 'tenis') return 'Tenis';
    if (dep === 'voley') return 'Vóley';
    return deporte.charAt(0).toUpperCase() + deporte.slice(1).toLowerCase();
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '—';
    if (fechaStr.includes('/')) return fechaStr;
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaStr;
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.style.display = 'none';
  }

  iniciarSesionAdmin(): void {
    this.iniciandoSesionRapida.set(true);
    const cred = new CredencialesDTOModelo();
    cred.correo = 'admin@sportfit.com';
    cred.password = 'admin123';
    this.authServicio.accederCliente(cred).subscribe({
      next: () => {
        localStorage.setItem('rol', 'ROLE_ADMINISTRADOR');
        this.iniciandoSesionRapida.set(false);
        this.alertaAutenticacion.set(false);
        this.cargarCanchas();
      },
      error: () => {
        this.iniciandoSesionRapida.set(false);
      }
    });
  }
}
