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
  styleUrls: ['./reporte-financiero.component.scss']
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
    { valor: '2024', etiqueta: '2024' },
    { valor: '2025', etiqueta: '2025' },
    { valor: '2026', etiqueta: '2026' }
  ];

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
  // Eje Y va de 0 a 2000. Ancho SVG: 680, Alto: 240
  puntosIngresos: PuntoGraficoIngreso[] = [
    { mes: 'Enero', monto: 1400, x: 20, y: 88 },
    { mes: 'Febrero', monto: 750, x: 78, y: 160 },
    { mes: 'Marzo', monto: 520, x: 136, y: 185 },
    { mes: 'Abril', monto: 490, x: 194, y: 188 },
    { mes: 'Mayo', monto: 400, x: 252, y: 198 },
    { mes: 'Junio', monto: 670, x: 310, y: 168 },
    { mes: 'Julio', monto: 1200, x: 368, y: 110 },
    { mes: 'Agosto', monto: 940, x: 426, y: 139 },
    { mes: 'Setiembre', monto: 450, x: 484, y: 192 },
    { mes: 'Octubre', monto: 620, x: 542, y: 174 },
    { mes: 'Noviembre', monto: 700, x: 600, y: 165 },
    { mes: 'Diciembre', monto: 1500, x: 658, y: 78 }
  ];

  escalasEjeY: number[] = [2000, 1600, 1200, 800, 400, 0];

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

    // Área cerrada para el sombreado inferior
    const primerPunto = this.puntosIngresos[0];
    const ultimoPunto = this.puntosIngresos[this.puntosIngresos.length - 1];
    this.trazadoArea = `${primerPunto.x},240 ${puntos} ${ultimoPunto.x},240`;
  }

  /**
   * Alterna el filtro 'Total'
   */
  onTotal(): void {
    this.esFiltroTotal = !this.esFiltroTotal;
  }

  /**
   * Ejecuta la búsqueda. Si se selecciona un período sin datos, dispara la modal Vista a34.
   */
  onBuscar(): void {
    if (this.anioSeleccionado === '2024') {
      // Simulación de período vacío para verificar la modal Vista a34
      this.dialog.open(SinIngresosModalComponent, {
        panelClass: 'dialogo-sin-datos',
        width: '540px'
      });
    }
  }

  /**
   * Acción para exportar reporte
   */
  onExportar(): void {
    // Listo para conectar con servicio de exportación a Excel/PDF
    console.log('Exportando reporte financiero...');
  }
}
