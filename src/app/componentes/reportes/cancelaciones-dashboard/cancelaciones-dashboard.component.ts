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

// DTOs
import {
  CancelacionDiaDTO,
  TotalCancelacionesDTO,
  MotivoCancelacionDTO,
  TendenciaCancelacionDTO,
  MontoPerdidoDTO
} from '../../../modelos/cancelaciones.dto';

// Modales
import { CostoEstimadoModalComponent } from './modales/costo-estimado-modal.component';
import { SinDatosModalComponent } from './modales/sin-datos-modal.component';

export interface OpcionSelector {
  valor: string;
  etiqueta: string;
}

@Component({
  selector: 'app-cancelaciones-dashboard',
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
  templateUrl: './cancelaciones-dashboard.component.html',
  styleUrl: './cancelaciones-dashboard.component.css'
})
export class CancelacionesDashboardComponent implements OnInit {
  // Filtros de búsqueda
  mesSeleccionado: string = '09';
  anioSeleccionado: string = '2026';

  mesesDisponibles: OpcionSelector[] = [
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

  aniosDisponibles: OpcionSelector[] = [
    { valor: '2024', etiqueta: '2024' },
    { valor: '2025', etiqueta: '2025' },
    { valor: '2026', etiqueta: '2026' }
  ];

  // Datos mock para KPIs y Gráficos (según Vista a30)
  totalCancelacionesDTO: TotalCancelacionesDTO = {
    totalCanceladas: 225
  };

  mesNombreKpi: string = 'SEPTIEMBRE';

  motivoPrincipalDTO = {
    cantidad: 85,
    tipoCancelacion: 'Inasistencia'
  };

  montoPerdidoDTO: MontoPerdidoDTO = {
    montoPerdido: 20000,
    periodo: 'JUN 2026'
  };

  // Gráfico 1: Distribución por categoría
  distribucionCategorias: MotivoCancelacionDTO[] = [
    { tipoCancelacion: 'Inasistencia', cantidad: 124, porcentaje: 55 },
    { tipoCancelacion: 'Cancelación por el cliente', cantidad: 67, porcentaje: 30 },
    { tipoCancelacion: 'Administración', cantidad: 23, porcentaje: 10 },
    { tipoCancelacion: 'Fuerza mayor', cantidad: 11, porcentaje: 5 }
  ];

  // Gráfico 2: Tendencia mensual (Ene a Set)
  mesesTendencia: string[] = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set'];

  // Puntos coordenados para SVG polylines (ancho 580, alto 190)
  // Inasistencia: Ene 50, Feb 22, Mar 22, Abr 30, May 28, Jun 25, Jul 22, Ago 20, Set 20
  puntosInasistencia: string = '45,85 105,152 165,152 225,133 285,137 345,145 405,152 465,156 525,156';

  // Cancelación por cliente: Ene 22, Feb 50, Mar 46, Abr 42, May 50, Jun 70, Jul 54, Ago 40, Set ...
  puntosCancelacionCliente: string = '45,152 105,85 165,95 225,105 285,85 345,35 405,75 465,110';

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  /**
   * Ejecuta la búsqueda basada en mes y año seleccionados.
   * Si no hay resultados o se selecciona un período vacío, muestra la modal Vista a32.
   */
  onBuscar(): void {
    // Si se busca Septiembre 2026 tenemos datos de prueba
    if (this.mesSeleccionado === '09' && this.anioSeleccionado === '2026') {
      this.totalCancelacionesDTO = { totalCanceladas: 225 };
      this.motivoPrincipalDTO = { cantidad: 85, tipoCancelacion: 'Inasistencia' };
      this.mesNombreKpi = 'SEPTIEMBRE';
    } else {
      // Simula período sin datos para visualizar y probar la modal Vista a32
      this.dialog.open(SinDatosModalComponent, {
        panelClass: 'dialogo-sin-datos',
        width: '540px'
      });
    }
  }

  /**
   * Abre la ventana modal de 'Costo estimado de perdida' (Vista a31).
   */
  onVerMonto(): void {
    this.dialog.open(CostoEstimadoModalComponent, {
      panelClass: 'dialogo-costo-estimado',
      width: '480px',
      data: {
        monto: `S/${this.montoPerdidoDTO.montoPerdido.toLocaleString('es-PE')}`,
        mes: 'JUN',
        anio: '2026'
      }
    });
  }

  /**
   * Limpia los filtros y restablece los valores por defecto.
   */
  onLimpiar(): void {
    this.mesSeleccionado = '';
    this.anioSeleccionado = '';
  }
}
