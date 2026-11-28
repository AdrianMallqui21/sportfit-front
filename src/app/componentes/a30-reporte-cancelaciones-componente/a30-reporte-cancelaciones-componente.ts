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
import { MOTIVOS_CANCELACION } from '../c13-mis-reservas-cliente-componente/c14-confirmar-cancelacion-dialogo/c14-confirmar-cancelacion-dialogo';

interface PuntoLinea {
  mes: number;
  valor: number;
  x: number;
  y: number;
}

interface LineaTendencia {
  motivo: string;
  color: string;
  puntos: PuntoLinea[];
  polilinea: string;
}

interface MarcaEjeY {
  valor: number;
  y: number;
}

interface BarraMotivo {
  motivo: string;
  lineas: string[];
  cantidad: number;
  porcentaje: number;
  color: string;
  y: number;
  ancho: number;
}

interface MarcaEjeBarras {
  valor: number;
  x: number;
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
  mesBuscado = 0;
  anioBuscado = 0;
  totalCancelaciones = 0;
  motivos: MotivoCancelacionModelo[] = [];
  lineas: LineaTendencia[] = [];
  marcasEjeY: MarcaEjeY[] = [];
  nombresMotivos: string[] = [];
  barras: BarraMotivo[] = [];
  marcasEjeBarras: MarcaEjeBarras[] = [];
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

  // Colores para los motivos
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

  // Colores de las barras
  private paletaBarras = ['#6a9aa3', '#7fb0b8', '#96e0ec', '#9ff3ff', '#b9f7ff', '#d2fbff'];

  // ----- Medidas del gráfico de barras (SVG) -----
  anchoBarras = 600;
  margenIzqBarras = 150;
  margenDerBarras = 55;
  margenSupBarras = 12;
  altoFilaBarras = 62;
  altoBarra = 34;
  altoSvgBarras = 0;

  // ----- Buscar -----

  buscar(): void {
    // mes y año son obligatorios
    if (!this.mesSeleccionado || !this.anioSeleccionado) return;
    const mes = this.mesSeleccionado;
    const anio = this.anioSeleccionado;
    this.mensajeError = '';
    console.log('Buscando cancelaciones de', mes, anio);

    forkJoin({
      total: this.reporteServicio.obtenerTotal(mes, anio),
      motivos: this.reporteServicio.obtenerMotivos(mes, anio),
      tendencia: this.reporteServicio.obtenerTendenciaAnual(anio),
    }).subscribe({
      next: ({ total, motivos, tendencia }) => {
        // si no hubo cancelaciones, se limpia todo y se muestra el diálogo a32
        if (total.totalCanceladas === 0) {
          console.log('Sin cancelaciones en el período');
          this.limpiarDatos();
          this.dialogo.open(A32SinCancelacionesDialogo, { width: '560px', maxWidth: '92vw' });
          this.detector.markForCheck();
          return;
        }
        // se guardan los datos y se arman los gráficos
        this.mesBuscado = mes;
        this.anioBuscado = anio;
        this.totalCancelaciones = total.totalCanceladas;
        this.motivos = motivos;
        this.armarTendencia(tendencia);
        this.armarBarras();
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

  get principalMotivo(): MotivoCancelacionModelo | null {
    return this.motivos.length > 0 ? this.motivos[0] : null;
  }

  get totalMotivos(): number {
    return this.motivos.reduce((suma, m) => suma + Number(m.cantidad), 0);
  }

  porcentaje(motivo: MotivoCancelacionModelo): number {
    return this.totalMotivos ? Math.round((Number(motivo.cantidad) * 100) / this.totalMotivos) : 0;
  }

  nombreMes(valor: number): string {
    return this.mesesDisponibles.find((m) => m.valor === valor)?.nombre ?? '';
  }

  colorMotivo(nombre: string): string {
    const posicion = this.nombresMotivos.indexOf(nombre);
    return this.paleta[(posicion < 0 ? 0 : posicion) % this.paleta.length];
  }

  // ----- Gráfico de barras -----
  private armarBarras(): void {
    const margenInf = 36;
    const anchoUtil = this.anchoBarras - this.margenIzqBarras - this.margenDerBarras;

    // la cantidad más grande entre todos los motivos
    const mayor = Math.max(0, ...this.motivos.map((m) => Number(m.cantidad)));

    const salto = mayor < 5 ? 1 : mayor < 10 ? 2 : mayor <= 50 ? 5 : 10;
    const maxX = (Math.floor(mayor / salto) + 1) * salto;

    this.marcasEjeBarras = [];
    for (let valor = 0; valor <= maxX; valor += salto) {
      this.marcasEjeBarras.push({ valor, x: this.margenIzqBarras + (valor / maxX) * anchoUtil });
    }

    this.barras = this.motivos.map((m, indice) => ({
      motivo: m.tipoCancelacion,
      lineas: this.partirTexto(m.tipoCancelacion),
      cantidad: Number(m.cantidad),
      porcentaje: this.porcentaje(m),
      color: this.paletaBarras[indice % this.paletaBarras.length],
      y:
        this.margenSupBarras +
        indice * this.altoFilaBarras +
        (this.altoFilaBarras - this.altoBarra) / 2,
      ancho: Math.max(3, (Number(m.cantidad) / maxX) * anchoUtil),
    }));

    this.altoSvgBarras =
      this.margenSupBarras + this.motivos.length * this.altoFilaBarras + margenInf;
  }

  private partirTexto(texto: string, max = 18): string[] {
    const lineas: string[] = [];
    let actual = '';
    for (const palabra of texto.split(' ')) {
      if (actual && (actual + ' ' + palabra).length > max) {
        lineas.push(actual);
        actual = palabra;
      } else {
        actual = (actual + ' ' + palabra).trim();
      }
    }
    if (actual) lineas.push(actual);
    return lineas;
  }

  // ----- Gráfico de líneas -----

  // Arma una línea por motivo con 12 puntos (si un mes no tiene datos vale 0).
  private armarTendencia(datos: TendenciaCancelacionModelo[]): void {

    const conDatos = [...new Set(datos.map((d) => d.tipoCancelacion))];

    // Orden fijo para los colores
    const extras = conDatos.filter((m) => !MOTIVOS_CANCELACION.includes(m)).sort();
    this.nombresMotivos = [...MOTIVOS_CANCELACION, ...extras];

    const mayor = Math.max(0, ...datos.map((d) => Number(d.cantidad)));
    const maxY = Math.max(4, Math.ceil(mayor / 4) * 4);
    this.marcasEjeY = [0, 1, 2, 3, 4].map((i) => {
      const valor = (maxY / 4) * i;
      return { valor, y: this.posicionY(valor, maxY) };
    });

    this.lineas = this.nombresMotivos
      .filter((m) => conDatos.includes(m))
      .map((nombre) => {
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

  private posicionX(mes: number): number {
    const ancho = this.anchoSvg - this.margenIzq - this.margenDer;
    return this.margenIzq + (mes - 1) * (ancho / 11);
  }

  private posicionY(valor: number, maxY: number): number {
    const alto = this.altoSvg - this.margenSup - this.margenInf;
    return this.altoSvg - this.margenInf - (valor / maxY) * alto;
  }

  // ----- Utilidades -----

  private limpiarDatos(): void {
    this.mesBuscado = 0;
    this.anioBuscado = 0;
    this.totalCancelaciones = 0;
    this.motivos = [];
    this.barras = [];
    this.marcasEjeBarras = [];
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
