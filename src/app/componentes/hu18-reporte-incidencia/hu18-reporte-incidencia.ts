import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-hu18-reporte-incidencia',
  styleUrl: './hu18-reporte-incidencia.css',
  templateUrl: './hu18-reporte-incidencia.html',
})
export class Hu18ReporteIncidencia {
  // =============================================
  // MENÚ DESPLEGABLE DE REPORTES
  // =============================================

  reportesAbiertos = false;

  alternarReportes(): void {
    this.reportesAbiertos = !this.reportesAbiertos;
  }

  // =============================================
  // FILTROS DE AÑO Y MES
  // =============================================

  anioSeleccionado = '';
  mesSeleccionado = '';

  anioAplicado = '';
  mesAplicado = '';

  readonly meses = [
    { valor: '1', nombre: 'Enero' },
    { valor: '2', nombre: 'Febrero' },
    { valor: '3', nombre: 'Marzo' },
    { valor: '4', nombre: 'Abril' },
    { valor: '5', nombre: 'Mayo' },
    { valor: '6', nombre: 'Junio' },
    { valor: '7', nombre: 'Julio' },
    { valor: '8', nombre: 'Agosto' },
    { valor: '9', nombre: 'Septiembre' },
    { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' },
    { valor: '12', nombre: 'Diciembre' },
  ];

  readonly mesesCortos = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  cambiarAnio(evento: Event): void {
    const select = evento.target as HTMLSelectElement;
    this.anioSeleccionado = select.value;
  }

  cambiarMes(evento: Event): void {
    const select = evento.target as HTMLSelectElement;
    this.mesSeleccionado = select.value;
  }

  buscar(): void {
    this.anioAplicado = this.anioSeleccionado;
    this.mesAplicado = this.mesSeleccionado;
  }

  limpiar(): void {
    this.anioSeleccionado = '';
    this.mesSeleccionado = '';
    this.anioAplicado = '';
    this.mesAplicado = '';
  }

  // =============================================
  // MÉTRICAS DE INCIDENCIAS
  // =============================================

  totalHistorico = 0;
  pendientes = 0;
  atendidas = 0;

  get periodoTexto(): string {
    const mes = this.meses.find((item) => item.valor === this.mesAplicado)?.nombre;

    if (mes && this.anioAplicado) {
      return `${mes} ${this.anioAplicado}`;
    }

    if (this.anioAplicado) {
      return `Año ${this.anioAplicado}`;
    }

    return 'Sin periodo seleccionado';
  }

  // =============================================
  // PORCENTAJES DEL GRÁFICO DE DONA
  // =============================================

  get porcentajeAtendidas(): number {
    const total = this.atendidas + this.pendientes;

    if (total === 0) {
      return 0;
    }

    return Math.round((this.atendidas / total) * 1000) / 10;
  }

  get porcentajePendientes(): number {
    const total = this.atendidas + this.pendientes;

    if (total === 0) {
      return 0;
    }

    return Math.round((this.pendientes / total) * 1000) / 10;
  }

  get fondoGraficoDona(): string {
    const total = this.atendidas + this.pendientes;

    if (total === 0) {
      return 'conic-gradient(#e5ebe6 0% 100%)';
    }

    return `conic-gradient(
    #15b980 0% ${this.porcentajeAtendidas}%,
    #ffc827 ${this.porcentajeAtendidas}% 100%
  )`;
  }
}
