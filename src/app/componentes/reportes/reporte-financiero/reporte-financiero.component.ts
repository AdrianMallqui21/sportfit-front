import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Modelos y DTOs
import {
  IngresoDiarioDTO,
  DistribucionPagoDTO,
  BannerPagoReporte
} from '../../../modelos/financiero.model';

// Modales
import { SinIngresosModalComponent } from './modales/sin-ingresos-modal.component';

export interface PuntoGraficoIngreso {
  mes: string;
  monto: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-reporte-financiero',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './reporte-financiero.component.html',
  styleUrl: './reporte-financiero.component.css'
})
export class ReporteFinancieroComponent implements OnInit {
  // Filtros de búsqueda
  esFiltroTotal: boolean = true;
  mesSeleccionado: string = '12';
  anioSeleccionado: string = '2025';

  mesesDisponibles = [
    { valor: '01', etiqueta: 'Enero' },
    { valor: '02', etiqueta: 'Febrero' },
    { valor: '03', etiqueta: 'Marzo' },
    { valor: '04', etiqueta: 'Abril' },
    { valor: '05', etiqueta: 'Mayo' },
    { valor: '06', etiqueta: 'Junio' },
    { valor: '07', etiqueta: 'Julio' },
    { valor: '08', etiqueta: 'Agosto' },
    { valor: '09', etiqueta: 'Septiembre' },
    { valor: '10', etiqueta: 'Octubre' },
    { valor: '11', etiqueta: 'Noviembre' },
    { valor: '12', etiqueta: 'Diciembre' }
  ];

  aniosDisponibles = [
    { valor: '2024', etiqueta: '2024 (Sin registros - Modal a34)' },
    { valor: '2025', etiqueta: '2025 (Con datos)' },
    { valor: '2026', etiqueta: '2026 (Con datos)' }
  ];

  // Selector para cambiar tipo de gráfico: 'lineal' | 'barras'
  tipoGraficaSeleccionada: string = 'lineal';
  tiposGrafica = [
    { valor: 'lineal', etiqueta: 'Gráfico lineal' },
    { valor: 'barras', etiqueta: 'Gráfico de barras' }
  ];

  // Datos mock para métricas del banner (Vista a33)
  bannerPago: BannerPagoReporte = {
    recaudacionTotal: 9460.0,
    promedioDiario: 900.0,
    diaPicoMonto: 1500.0,
    diaPicoFecha: '15/12/2025',
    pagosRealizados: 116
  };

  // Datos mock para distribución por método de pago (Vista a33)
  distribucionMetodosPago: DistribucionPagoDTO[] = [
    { metodoPago: 'Yape', totalRecaudado: 80.2, cantidadTransacciones: 58, porcentaje: 50.57 },
    { metodoPago: 'Transferencia', totalRecaudado: 47.5, cantidadTransacciones: 35, porcentaje: 29.95 },
    { metodoPago: 'Plin', totalRecaudado: 30.9, cantidadTransacciones: 23, porcentaje: 19.48 }
  ];

  // Puntos del gráfico lineal de ingresos mensuales
  puntosIngresos: PuntoGraficoIngreso[] = [
    { mes: 'Enero', monto: 1400, x: 25, y: 88 },
    { mes: 'Febrero', monto: 750, x: 82, y: 155 },
    { mes: 'Marzo', monto: 520, x: 139, y: 180 },
    { mes: 'Abril', monto: 490, x: 196, y: 183 },
    { mes: 'Mayo', monto: 400, x: 253, y: 192 },
    { mes: 'Junio', monto: 670, x: 310, y: 165 },
    { mes: 'Julio', monto: 1200, x: 367, y: 110 },
    { mes: 'Agosto', monto: 940, x: 424, y: 136 },
    { mes: 'Setiembre', monto: 450, x: 481, y: 187 },
    { mes: 'Octubre', monto: 620, x: 538, y: 170 },
    { mes: 'Noviembre', monto: 700, x: 595, y: 162 },
    { mes: 'Diciembre', monto: 1500, x: 652, y: 78 }
  ];

  escalasEjeY: number[] = [2000, 1600, 1200, 800, 400, 0];
  maxMontoGrafico: number = 2000;

  trazadoLinea: string = '';
  trazadoArea: string = '';

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.calcularTrazadosGrafico();
  }

  /**
   * Genera los trazados SVG para la línea y el área con degradado semitransparente.
   */
  calcularTrazadosGrafico(): void {
    const puntos = this.puntosIngresos.map(p => `${p.x},${p.y}`).join(' ');
    this.trazadoLinea = puntos;

    const primerPunto = this.puntosIngresos[0];
    const ultimoPunto = this.puntosIngresos[this.puntosIngresos.length - 1];
    this.trazadoArea = `${primerPunto.x},240 ${puntos} ${ultimoPunto.x},240`;
  }

  /**
   * Calcula la altura porcentual de cada barra en el modo de barras verticales.
   */
  calcularAlturaBarraMes(monto: number): string {
    const porcentaje = Math.min((monto / this.maxMontoGrafico) * 82, 82);
    return `${porcentaje}%`;
  }

  /**
   * Alterna el filtro 'Total'
   */
  onTotal(): void {
    this.esFiltroTotal = !this.esFiltroTotal;
    if (!this.esFiltroTotal) {
      this.abrirModalSinDatos();
    }
  }

  /**
   * Se ejecuta al cambiar Mes o Año en los filtros.
   * Si se selecciona el año 2024, dispara la modal Vista a34 para probarla fácilmente.
   */
  onFiltroChange(): void {
    if (this.anioSeleccionado === '2024') {
      this.abrirModalSinDatos();
    }
  }

  /**
   * Botón buscar explícito
   */
  onBuscar(): void {
    if (this.anioSeleccionado === '2024' || !this.esFiltroTotal && this.mesSeleccionado === '01') {
      this.abrirModalSinDatos();
    }
  }

  /**
   * Abre la ventana modal de alerta (Vista a34).
   */
  abrirModalSinDatos(): void {
    this.dialog.open(SinIngresosModalComponent, {
      panelClass: 'dialogo-sin-datos',
      width: '540px'
    });
  }

  /**
   * Acción para exportar reporte
   */
  onExportar(): void {
    console.log('Exportando reporte financiero...');
  }
}
