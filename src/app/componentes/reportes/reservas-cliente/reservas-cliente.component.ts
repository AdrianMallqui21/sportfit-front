import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Modelos y DTOs
import { ReservaClienteDTO, FiltroReservasClienteParams } from '../../../modelos/reservas-cliente.model';

// Modales
import { SinReservasModalComponent } from './modales/sin-reservas-modal.component';

@Component({
  selector: 'app-reservas-cliente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule
  ],
  templateUrl: './reservas-cliente.component.html',
  styleUrls: ['./reservas-cliente.component.scss']
})
export class ReservasClienteComponent implements OnInit {
  // Formulario Reactivo de Filtros
  formularioFiltros!: FormGroup;

  // Selector de Tipo de Gráfica ('barras_horizontales' o 'barras_verticales')
  tipoGraficaSeleccionada: string = 'barras_horizontales';
  tiposGrafica = [
    { valor: 'barras_horizontales', etiqueta: 'Barras horizontales' },
    { valor: 'barras_verticales', etiqueta: 'Barras verticales' }
  ];

  // Columnas para Angular Material mat-table
  columnasTabla: string[] = ['clienteId', 'nombreCliente', 'ultimaReserva', 'totalReservas'];

  // Datos mock iniciales idénticos a la Vista a35
  listaClientesMock: ReservaClienteDTO[] = [
    { clienteId: 'C001', nombreCliente: 'Tony Montana', ultimaReserva: '2026-09-01', totalReservas: 50 },
    { clienteId: 'C002', nombreCliente: 'Andres Merino', ultimaReserva: '2026-09-01', totalReservas: 30 },
    { clienteId: 'C003', nombreCliente: 'Pedro Castillo', ultimaReserva: '2026-09-01', totalReservas: 24 },
    { clienteId: 'C004', nombreCliente: 'Keiko Fujimori', ultimaReserva: '2026-09-01', totalReservas: 21 },
    { clienteId: 'C005', nombreCliente: 'Jhon Trabolta', ultimaReserva: '2026-09-01', totalReservas: 20 },
    { clienteId: 'C006', nombreCliente: 'Luis Miguel', ultimaReserva: '2026-09-01', totalReservas: 15 },
    { clienteId: 'C007', nombreCliente: 'Cristiano Ronaldo', ultimaReserva: '2026-09-01', totalReservas: 7 },
    { clienteId: 'C008', nombreCliente: 'Jefry Solar', ultimaReserva: '2026-09-01', totalReservas: 6 }
  ];

  // Colección activa que alimenta la tabla y las barras
  clientes: ReservaClienteDTO[] = [];

  // Escala numérica para el eje X (horizontales) y eje Y (verticales)
  escalasEjeX: number[] = [0, 5, 10, 15, 20, 25, 30, 35, 45, 50];
  escalasEjeY: number[] = [50, 40, 30, 20, 10, 0];
  maximoEscala: number = 50;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.clientes = [...this.listaClientesMock];
  }

  inicializarFormulario(): void {
    this.formularioFiltros = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      minReservas: [0],
      maxReservas: [0],
      top: [0]
    });
  }

  /**
   * Abre el selector nativo de fecha del navegador al hacer clic en el ícono de calendario.
   */
  abrirCalendario(input: HTMLInputElement): void {
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
      }
    } catch {
      input.focus();
    }
  }

  /**
   * Calcula el ancho porcentual para barras horizontales (máximo 86% para dar espacio holgado al valor numérico).
   */
  calcularAnchoBarra(total: number): string {
    const factor = Math.min(total / this.maximoEscala, 1);
    const porcentaje = factor * 86;
    return `${porcentaje}%`;
  }

  /**
   * Calcula la altura porcentual para barras verticales (máximo 84% para dejar espacio a la cifra superior).
   */
  calcularAlturaBarra(total: number): string {
    const factor = Math.min(total / this.maximoEscala, 1);
    const porcentaje = factor * 84;
    return `${porcentaje}%`;
  }

  /**
   * Obtiene la clase de color para cada barra de acuerdo a la captura de Vista a35
   */
  obtenerClaseBarra(index: number): string {
    switch (index) {
      case 0: return 'barra-verde-brillante'; // 50
      case 1: return 'barra-verde-menta';     // 30
      case 2: return 'barra-verde-claro';     // 24
      case 3: return 'barra-verde-menta-suave'; // 21
      case 4: return 'barra-verde-bosque';    // 20
      case 5: return 'barra-verde-medio';     // 15
      case 6: return 'barra-verde-pastel';    // 7
      case 7: return 'barra-verde-menta-claro'; // 6
      default: return 'barra-verde-medio';
    }
  }

  /**
   * Ejecuta la búsqueda según los criterios del formulario.
   */
  onBuscar(): void {
    const filtros: FiltroReservasClienteParams = this.formularioFiltros.value;

    if (filtros.minReservas && filtros.minReservas > 50) {
      this.clientes = [];
      this.dialog.open(SinReservasModalComponent, {
        panelClass: 'dialogo-sin-datos',
        width: '540px'
      });
    } else {
      let resultado = [...this.listaClientesMock];

      if (filtros.minReservas && filtros.minReservas > 0) {
        resultado = resultado.filter(c => c.totalReservas >= filtros.minReservas!);
      }
      if (filtros.maxReservas && filtros.maxReservas > 0) {
        resultado = resultado.filter(c => c.totalReservas <= filtros.maxReservas!);
      }
      if (filtros.top && filtros.top > 0) {
        resultado = resultado.slice(0, filtros.top);
      }

      if (resultado.length === 0) {
        this.clientes = [];
        this.dialog.open(SinReservasModalComponent, {
          panelClass: 'dialogo-sin-datos',
          width: '540px'
        });
      } else {
        this.clientes = resultado;
      }
    }
  }

  /**
   * Limpia el formulario y restablece la lista de clientes completa.
   */
  onLimpiar(): void {
    this.formularioFiltros.reset({
      fechaDesde: '',
      fechaHasta: '',
      minReservas: 0,
      maxReservas: 0,
      top: 0
    });
    this.clientes = [...this.listaClientesMock];
  }
}
