import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { SedeCanchaModelo, SedeModelo, TipoCanchaModelo } from '../../modelos/espacio-deportivo-modelo';
import { EspacioDeportivoServicio } from '../../servicios/espacio-deportivo-servicio';
import { A23EditarEspacioDialogo } from './a23-editar-espacio-dialogo/a23-editar-espacio-dialogo';
import { A24DesactivarEspacioDialogo } from './a24-desactivar-espacio-dialogo/a24-desactivar-espacio-dialogo';
import { A25ReservasEspacioDialogo } from './a25-reservas-espacio-dialogo/a25-reservas-espacio-dialogo';

@Component({
  selector: 'app-a22-gestion-espacios-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './a22-gestion-espacios-componente.html',
  styleUrl: './a22-gestion-espacios-componente.css'
})
export class A22GestionEspaciosComponente implements OnInit {
  private readonly espacioServicio = inject(EspacioDeportivoServicio);
  private readonly dialog = inject(MatDialog);

  // Estados de datos
  canchas = signal<SedeCanchaModelo[]>([]);
  canchasFiltradas = signal<SedeCanchaModelo[]>([]);
  sedes = signal<SedeModelo[]>([]);
  tiposCancha = signal<TipoCanchaModelo[]>([]);
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

  totalActivos = computed(() => this.canchasFiltradas().filter(c => c.estado).length);
  totalDesactivados = computed(() => this.canchasFiltradas().filter(c => !c.estado).length);

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.alertaAutenticacion.set(true);
    }
    this.cargarSedes();
    this.cargarTiposCancha();
    this.cargarCanchas();
  }

  cargarSedes(): void {
    this.espacioServicio.listarSedes().subscribe({
      next: (data) => {
        this.sedes.set(data || []);
        this.rehidratarCanchas();
      },
      error: () => this.sedes.set([])
    });
  }

  cargarTiposCancha(): void {
    this.espacioServicio.listarTiposCancha().subscribe({
      next: (data) => {
        this.tiposCancha.set(data || []);
        this.rehidratarCanchas();
      },
      error: () => this.tiposCancha.set([])
    });
  }

  cargarCanchas(): void {
    this.cargando.set(true);
    this.espacioServicio.list().subscribe({
      next: (data) => {
        const lista = (data || []).map(c => this.enriquecerCancha(c));
        this.canchas.set(lista);
        this.aplicarFiltros();
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

  private rehidratarCanchas(): void {
    if (this.canchas().length === 0) return;
    const lista = this.canchas().map(c => this.enriquecerCancha(c));
    this.canchas.set(lista);
    this.aplicarFiltros();
  }

  private enriquecerCancha(c: SedeCanchaModelo): SedeCanchaModelo {
    const idSede = c.idSedeSede ?? c.sede?.idSede;
    const idTipo = c.idTipoCancha ?? c.cancha?.idTipoCancha;

    const sedeObj = this.sedes().find(s => s.idSede === idSede) || c.sede;
    const tipoObj = this.tiposCancha().find(t => t.idTipoCancha === idTipo) || c.cancha;

    return {
      ...c,
      idSedeSede: idSede,
      idTipoCancha: idTipo,
      sede: sedeObj,
      cancha: tipoObj
    };
  }

  // --- FILTROS DE BÚSQUEDA ---
  aplicarFiltros(): void {
    let lista = this.canchas();

    // 1. Filtro Estado
    if (this.filtroEstado !== '') {
      const estadoBool = this.filtroEstado === 'true';
      lista = lista.filter(c => c.estado === estadoBool);
    }

    // 2. Filtro Sede (soporta DTO plano idSedeSede o sede.idSede)
    if (this.filtroSede !== '' && this.filtroSede !== null && this.filtroSede !== undefined) {
      const idSedeNum = Number(this.filtroSede);
      lista = lista.filter(c => (c.idSedeSede ?? c.sede?.idSede) === idSedeNum);
    }

    // 3. Filtro Deporte (normaliza tildes y variantes BASKET/BASQUET)
    if (this.filtroDeporte) {
      const buscado = this.normalizarDeporte(this.filtroDeporte);
      lista = lista.filter(c => {
        const dep = this.normalizarDeporte(c.cancha?.deporte || '');
        if (buscado === 'BASKET' || buscado === 'BASQUET') {
          return dep === 'BASKET' || dep === 'BASQUET';
        }
        return dep === buscado;
      });
    }

    this.canchasFiltradas.set(lista);
  }

  private normalizarDeporte(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroSede = '';
    this.filtroDeporte = '';
    this.canchasFiltradas.set(this.canchas());
  }

  // --- VISTA a23: EDICIÓN DE ESPACIOS (MatDialog) ---
  abrirModalEditar(cancha: SedeCanchaModelo): void {
    const dialogRef = this.dialog.open(A23EditarEspacioDialogo, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      data: {
        cancha,
        opcionesDeporte: this.opcionesDeporte,
        opcionesAforo: this.opcionesAforo,
        tiposCancha: this.tiposCancha()
      }
    });

    dialogRef.afterClosed().subscribe((resp: SedeCanchaModelo | null | undefined) => {
      if (resp && resp.idSedeCancha) {
        const enriquecida = this.enriquecerCancha(resp);
        const actualizadas = this.canchas().map(item =>
          item.idSedeCancha === enriquecida.idSedeCancha ? enriquecida : item
        );
        this.canchas.set(actualizadas);
        this.aplicarFiltros();
      }
    });
  }

  // --- VISTA a24/a25: DESACTIVACIÓN DE ESPACIOS (MatDialog) ---
  abrirModalDesactivar(cancha: SedeCanchaModelo): void {
    const dialogRef = this.dialog.open(A24DesactivarEspacioDialogo, {
      width: '420px',
      maxWidth: '95vw',
      data: cancha
    });

    dialogRef.afterClosed().subscribe((desactivado: boolean | undefined) => {
      if (desactivado) {
        const actualizadas = this.canchas().map(item =>
          item.idSedeCancha === cancha.idSedeCancha ? { ...item, estado: false } : item
        );
        this.canchas.set(actualizadas);
        this.aplicarFiltros();
      }
    });
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

  // --- MODAL VER RESERVAS (MatDialog ED67) ---
  abrirModalReservas(cancha: SedeCanchaModelo): void {
    this.dialog.open(A25ReservasEspacioDialogo, {
      width: '620px',
      maxWidth: '95vw',
      data: cancha
    });
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

}
