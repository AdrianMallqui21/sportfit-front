import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect } from '@angular/material/select';
import { ReporteCancelacionServicio } from '../../servicios/reporte-cancelacion-servicio';
import {
  MotivoCancelacionModelo,
  TendenciaCancelacionModelo,
} from '../../modelos/reporte-cancelacion-modelo';
import {
  A31CostoEstimadoDialogo,
  DatosCostoEstimado,
} from './a31-costo-estimado-dialogo/a31-costo-estimado-dialogo';
import { A32SinCancelacionesDialogo } from './a32-sin-cancelaciones-dialogo/a32-sin-cancelaciones-dialogo';

// Un punto de una línea del gráfico: su posición en el SVG y el valor que representa.
interface PuntoLinea {
  mes: number;
  valor: number;
  x: number;
  y: number;
}

// Una línea del gráfico de tendencia: un motivo con sus 12 puntos (uno por mes).
interface LineaTendencia {
  motivo: string;
  color: string;
  puntos: PuntoLinea[];
  polilinea: string; // los puntos como texto "x,y x,y ..." para dibujar la línea
}

// Una marca del eje vertical (ej.: la línea guía del valor 4).
interface MarcaEjeY {
  valor: number;
  y: number;
}

@Component({
  imports: [MatCard, MatButton, MatFormField, MatLabel, MatSelect, MatOption, MatIcon],
  selector: 'app-a30-reporte-cancelaciones-componente',
  styleUrl: './a30-reporte-cancelaciones-componente.css',
  templateUrl: './a30-reporte-cancelaciones-componente.html',
})
export class A30ReporteCancelacionesComponente {
  reporteServicio: ReporteCancelacionServicio = inject(ReporteCancelacionServicio);
  dialogo = inject(MatDialog);
  detector = inject(ChangeDetectorRef);

  // ----- Filtros (0 significa "sin elegir") -----
  mesesDisponibles = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' },
  ];
  aniosDisponibles: number[] = [2026, 2025, 2024];
  mesSeleccionado = 0;
  anioSeleccionado = 0;

  // ----- Datos del reporte (se llenan al pulsar "Buscar") -----
  mesBuscado = 0; // mes mostrado en la tarjeta de total
  anioBuscado = 0;
  totalCancelaciones = 0;
  motivos: MotivoCancelacionModelo[] = []; // para las barras
  lineas: LineaTendencia[] = []; // para el gráfico de líneas
  marcasEjeY: MarcaEjeY[] = [];
  nombresMotivos: string[] = []; // motivos del año, para asignar colores fijos
  mensajeError = '';

  // ----- Medidas del gráfico SVG -----
  anchoSvg = 600;
  altoSvg = 280;
  margenIzq = 44;
  margenDer = 20;
  margenSup = 20;
  margenInf = 40;
  mesesCortos = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Oct',
    'Nov',
    'Dic',
  ];
  // Posición horizontal de cada mes (no cambia, se calcula una sola vez)
  marcasEjeX = this.mesesCortos.map((texto, indice) => ({ texto, x: this.posicionX(indice + 1) }));

  // Colores para los motivos (se reparten en orden alfabético para que no cambien)
  private paleta = [
    '#6a9aa3',
    '#39b985',
    '#f2ca25',
    '#f59e0b',
    '#3b82f6',
    '#8b5cf6',
    '#ef4444',
    '#14b8a6',
  ];

  // ----- Buscar -----

  buscar(): void {
    // Paso 1: mes y año son obligatorios
    if (!this.mesSeleccionado || !this.anioSeleccionado) return;
    const mes = this.mesSeleccionado;
    const anio = this.anioSeleccionado;
    this.mensajeError = '';
    console.log('Buscando cancelaciones de', mes, anio);

    // Paso 2: las tres consultas se hacen a la vez
    forkJoin({
      total: this.reporteServicio.obtenerTotal(mes, anio),
      motivos: this.reporteServicio.obtenerMotivos(mes, anio),
      tendencia: this.reporteServicio.obtenerTendenciaAnual(anio),
    }).subscribe({
      next: ({ total, motivos, tendencia }) => {
        // Paso 3: si no hubo cancelaciones, se limpia todo y se muestra el diálogo a32
        if (total.totalCanceladas === 0) {
          console.log('Sin cancelaciones en el período');
          this.limpiarDatos();
          this.dialogo.open(A32SinCancelacionesDialogo, { width: '560px', maxWidth: '92vw' });
          this.detector.markForCheck();
          return;
        }
        // Paso 4: se guardan los datos y se arman los gráficos
        this.mesBuscado = mes;
        this.anioBuscado = anio;
        this.totalCancelaciones = total.totalCanceladas;
        this.motivos = motivos;
        this.armarTendencia(tendencia);
        this.detector.markForCheck();
      },
      error: (err) => this.mostrarError('No se pudo obtener el reporte', err),
    });
  }

  // Se ejecuta con "Ver monto":
  verMonto(): void {
    if (!this.mesSeleccionado || !this.anioSeleccionado) return;
    const mes = this.mesSeleccionado;
    const anio = this.anioSeleccionado;

    this.reporteServicio.obtenerMontoPerdido(mes, anio).subscribe({
      next: (data) => {
        const monto = Number(data.montoPerdido);
        // Monto 0 = no hubo reservas canceladas ese mes
        if (monto === 0) {
          this.dialogo.open(A32SinCancelacionesDialogo, { width: '560px', maxWidth: '92vw' });
          return;
        }
        const datos: DatosCostoEstimado = { monto, mes, anio };
        this.dialogo.open(A31CostoEstimadoDialogo, {
          data: datos,
          width: '560px',
          maxWidth: '92vw',
        });
      },
      error: (err) => this.mostrarError('No se pudo obtener el monto perdido', err),
    });
  }

  // Se ejecuta con "Limpiar": borra los filtros y los datos del reporte.
  limpiar(): void {
    this.mesSeleccionado = 0;
    this.anioSeleccionado = 0;
    this.mensajeError = '';
    this.limpiarDatos();
  }

  // ----- Datos para la pantalla -----

  // Motivo con más cancelaciones: el back ya los manda ordenados de mayor a menor.
  get principalMotivo(): MotivoCancelacionModelo | null {
    return this.motivos.length > 0 ? this.motivos[0] : null;
  }

  // Suma de cancelaciones de todos los motivos (base para calcular los porcentajes).
  get totalMotivos(): number {
    return this.motivos.reduce((suma, m) => suma + Number(m.cantidad), 0);
  }

  // Porcentaje que representa un motivo del total (para el ancho de la barra).
  porcentaje(motivo: MotivoCancelacionModelo): number {
    return this.totalMotivos ? Math.round((Number(motivo.cantidad) * 100) / this.totalMotivos) : 0;
  }

  // Nombre del mes a partir de su número: 9 -> 'Septiembre'.
  nombreMes(valor: number): string {
    return this.mesesDisponibles.find((m) => m.valor === valor)?.nombre ?? '';
  }

  // Color de un motivo: el mismo en las barras y en las líneas.
  colorMotivo(nombre: string): string {
    const posicion = this.nombresMotivos.indexOf(nombre);
    return this.paleta[(posicion < 0 ? 0 : posicion) % this.paleta.length];
  }

  // ----- Gráfico de líneas -----

  // Arma una línea por motivo con 12 puntos (si un mes no tiene datos vale 0).
  private armarTendencia(datos: TendenciaCancelacionModelo[]): void {
    // Motivos distintos del año, ordenados para que los colores no cambien entre búsquedas
    this.nombresMotivos = [...new Set(datos.map((d) => d.tipoCancelacion))].sort();

    // Valor máximo del eje vertical: múltiplo de 4 (mínimo 4) para que las marcas sean enteras
    const mayor = Math.max(0, ...datos.map((d) => Number(d.cantidad)));
    const maxY = Math.max(4, Math.ceil(mayor / 4) * 4);
    this.marcasEjeY = [0, 1, 2, 3, 4].map((i) => {
      const valor = (maxY / 4) * i;
      return { valor, y: this.posicionY(valor, maxY) };
    });

    this.lineas = this.nombresMotivos.map((nombre) => {
      const puntos: PuntoLinea[] = this.mesesCortos.map((_, indice) => {
        const mes = indice + 1;
        const dato = datos.find((d) => d.mes === mes && d.tipoCancelacion === nombre);
        const valor = dato ? Number(dato.cantidad) : 0;
        return { mes, valor, x: this.posicionX(mes), y: this.posicionY(valor, maxY) };
      });
      return {
        motivo: nombre,
        color: this.colorMotivo(nombre),
        puntos,
        polilinea: puntos.map((p) => `${p.x},${p.y}`).join(' '),
      };
    });
  }

  // Posición horizontal de un mes (1 a 12) dentro del SVG.
  private posicionX(mes: number): number {
    const ancho = this.anchoSvg - this.margenIzq - this.margenDer;
    return this.margenIzq + (mes - 1) * (ancho / 11);
  }

  // Posición vertical de un valor dentro del SVG (los valores altos van arriba).
  private posicionY(valor: number, maxY: number): number {
    const alto = this.altoSvg - this.margenSup - this.margenInf;
    return this.altoSvg - this.margenInf - (valor / maxY) * alto;
  }

  // ----- Utilidades -----

  // Deja las tarjetas y los gráficos como al abrir la pantalla.
  private limpiarDatos(): void {
    this.mesBuscado = 0;
    this.anioBuscado = 0;
    this.totalCancelaciones = 0;
    this.motivos = [];
    this.lineas = [];
    this.marcasEjeY = [];
    this.nombresMotivos = [];
  }

  // Guarda y muestra un error. Usa el mensaje que manda el back si existe.
  private mostrarError(mensaje: string, err: any): void {
    console.error(mensaje, err);
    this.mensajeError = err?.error?.message || mensaje;
    this.detector.markForCheck();
  }
}
