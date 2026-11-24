import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import {
  ReporteReservaCliente,
  ReporteReservaClienteServicio,
} from '../../servicios/reporte-reserva-cliente-servicio';

import { A36AlertaDialogo } from './a36-alerta-dialogo/a36-alerta-dialogo';

function paginadorEspanol(): MatPaginatorIntl {
  const paginador = new MatPaginatorIntl();

  paginador.itemsPerPageLabel = 'Registros por página:';
  paginador.nextPageLabel = 'Página siguiente';
  paginador.previousPageLabel = 'Página anterior';
  paginador.firstPageLabel = 'Primera página';
  paginador.lastPageLabel = 'Última página';

  paginador.getRangeLabel = (pagina, tamanio, total) => {
    if (total === 0) {
      return '0 de 0';
    }

    const inicio = pagina * tamanio + 1;
    const fin = Math.min((pagina + 1) * tamanio, total);

    return `${inicio} - ${fin} de ${total}`;
  };

  return paginador;
}

@Component({
  selector: 'app-a35-reporte-cliente-componente',
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      useFactory: paginadorEspanol,
    },
  ],
  templateUrl: './a35-reporte-cliente-componente.html',
  styleUrl: './a35-reporte-cliente-componente.css',
})
export class A35ReporteClienteComponente implements OnInit, AfterViewInit {
  private reporteServicio = inject(ReporteReservaClienteServicio);
  private dialogo = inject(MatDialog);
  private detector = inject(ChangeDetectorRef);

  @ViewChild(MatPaginator) paginador!: MatPaginator;
  @ViewChild(MatSort) ordenador!: MatSort;

  fechaDesde = '';
  fechaHasta = '';
  minReservas: number | null = null;
  maxReservas: number | null = null;
  top: number | null = null;

  tipoGrafico: 'horizontal' | 'vertical' = 'horizontal';

  columnas: string[] = ['clienteId', 'nombreCliente', 'ultimaReserva', 'totalReservas'];

  dataSource = new MatTableDataSource<ReporteReservaCliente>([]);

  datosGrafico: ReporteReservaCliente[] = [];
  escalaMaxima = 5;
  marcasEscala: number[] = [0, 1, 2, 3, 4, 5];

  cargando = false;
  mensajeError = '';

  private coloresGrafico = [
    '#77d96a',
    '#81dfae',
    '#5fcf82',
    '#d0efb0',
    '#74a884',
    '#67d68d',
    '#88cfb4',
    '#90e1a3',
  ];

  ngOnInit(): void {
    this.cargarReporte(false);
  }

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (registro, columna) => {
      switch (columna) {
        case 'clienteId':
          return Number(String(registro.clienteId).replace(/\D/g, '')) || 0;

        case 'nombreCliente':
          return registro.nombreCliente.toLowerCase();

        case 'ultimaReserva':
          return registro.ultimaReserva || '';

        case 'totalReservas':
          return Number(registro.totalReservas);

        default:
          return '';
      }
    };

    this.dataSource.paginator = this.paginador;
    this.dataSource.sort = this.ordenador;
  }

  buscar(): void {
    this.cargarReporte(true);
  }

  private cargarReporte(mostrarAlerta: boolean): void {
    this.mensajeError = '';

    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      this.mensajeError = 'La fecha desde no puede ser posterior a la fecha hasta.';
      return;
    }

    if (
      (this.minReservas !== null && this.minReservas < 0) ||
      (this.maxReservas !== null && this.maxReservas < 0) ||
      (this.top !== null && this.top < 0)
    ) {
      this.mensajeError = 'Las cantidades de reservas no pueden ser negativas.';
      return;
    }

    if (
      this.minReservas !== null &&
      this.maxReservas !== null &&
      this.minReservas > this.maxReservas
    ) {
      this.mensajeError = 'La cantidad mínima no puede superar la máxima.';
      return;
    }

    this.cargando = true;

    this.reporteServicio
      .obtenerReporte(
        this.fechaDesde,
        this.fechaHasta,
        this.minReservas,
        this.maxReservas,
        this.top,
      )
      .subscribe({
        next: (datos) => {
          this.cargando = false;

          if (datos.length === 0) {
            this.dataSource.data = [];
            this.datosGrafico = [];
            this.paginador?.firstPage();

            if (mostrarAlerta) {
              this.dialogo.open(A36AlertaDialogo, {
                width: '470px',
                maxWidth: '92vw',
              });
            }

            this.detector.markForCheck();
            return;
          }

          this.dataSource.data = datos;

          this.datosGrafico = [...datos]
            .sort((a, b) => Number(b.totalReservas) - Number(a.totalReservas))
            .slice(0, 8);

          this.calcularEscala();

          this.paginador?.firstPage();

          this.detector.markForCheck();
        },

        error: (error: HttpErrorResponse) => {
          this.cargando = false;

          if (error.status === 401) {
            this.mensajeError = 'Tu sesión ha expirado. Inicia sesión nuevamente.';
          } else if (error.status === 403) {
            this.mensajeError = 'No tienes permisos para consultar este reporte.';
          } else {
            this.mensajeError =
              'No se pudo cargar el reporte. Verifica la conexión con el backend.';
          }

          this.detector.markForCheck();
        },
      });
  }

  limpiar(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.minReservas = null;
    this.maxReservas = null;
    this.top = null;
    this.tipoGrafico = 'horizontal';
    this.mensajeError = '';

    this.cargarReporte(false);
  }

  private calcularEscala(): void {
    const mayor = Math.max(0, ...this.datosGrafico.map((item) => Number(item.totalReservas)));

    this.escalaMaxima = Math.max(5, Math.ceil(mayor / 5) * 5);

    this.marcasEscala = Array.from({ length: 6 }, (_, indice) => (indice * this.escalaMaxima) / 5);
  }

  anchoBarra(cantidad: number): number {
    if (this.escalaMaxima === 0) {
      return 0;
    }

    return Math.min(100, (Number(cantidad) / this.escalaMaxima) * 100);
  }

  colorBarra(indice: number): string {
    return this.coloresGrafico[indice % this.coloresGrafico.length];
  }

  codigoCliente(id: string): string {
    const valor = String(id);

    if (/^C\d+$/i.test(valor)) {
      return valor.toUpperCase();
    }

    if (/^\d+$/.test(valor)) {
      return 'C' + valor.padStart(3, '0');
    }

    return valor;
  }
}
