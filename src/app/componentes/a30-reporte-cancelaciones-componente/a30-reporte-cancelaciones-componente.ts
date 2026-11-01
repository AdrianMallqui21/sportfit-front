import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RegistroCancelacion {
  mes: string; // YYYY-MM, una fila por mes y motivo.
  motivo: string;
  cantidad: number;
  monto: number;
}

@Component({
  selector: 'app-a30-reporte-cancelaciones-componente',
  imports: [FormsModule, DecimalPipe, CurrencyPipe],
  templateUrl: './a30-reporte-cancelaciones-componente.html',
  styleUrl: './a30-reporte-cancelaciones-componente.css',
})
export class A30ReporteCancelacionesComponente {
  // Sin datos de prueba. Actualizar esta señal cuando se conecte el servicio del backend.
  readonly cancelaciones = signal<RegistroCancelacion[]>([]);
  readonly meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  readonly colores = ['#65979a', '#82b1b5', '#98dce0', '#a6eff3', '#e0be45', '#37ba83'];
  mesSeleccionado = '';
  anioSeleccionado = new Date().getFullYear();
  readonly verMonto = signal(false);
  readonly filtros = signal({ mes: '', anio: new Date().getFullYear() });
  readonly anios = computed(() => [...new Set([new Date().getFullYear(), ...this.cancelaciones().map(fila => Number(fila.mes.slice(0, 4)))])].sort((a, b) => b - a));
  readonly registrosAnuales = computed(() => this.cancelaciones().filter(fila => Number(fila.mes.slice(0, 4)) === this.filtros().anio));
  readonly registrosFiltrados = computed(() => this.registrosAnuales().filter(fila => !this.filtros().mes || fila.mes.slice(5, 7) === this.filtros().mes));
  readonly total = computed(() => this.registrosFiltrados().reduce((suma, fila) => suma + fila.cantidad, 0));
  readonly montoTotal = computed(() => this.registrosFiltrados().reduce((suma, fila) => suma + fila.monto, 0));
  readonly periodo = computed(() => `${this.filtros().mes ? this.meses[Number(this.filtros().mes) - 1] : 'Todos los meses'} · ${this.filtros().anio}`);
  readonly categorias = computed(() => {
    const grupos = new Map<string, { motivo: string; cantidad: number; monto: number }>();
    for (const fila of this.registrosFiltrados()) {
      const grupo = grupos.get(fila.motivo) ?? { motivo: fila.motivo, cantidad: 0, monto: 0 };
      grupo.cantidad += fila.cantidad;
      grupo.monto += fila.monto;
      grupos.set(fila.motivo, grupo);
    }
    return [...grupos.values()].sort((a, b) => b.cantidad - a.cantidad).map((fila, indice) => ({ ...fila, porcentaje: this.total() ? fila.cantidad / this.total() * 100 : 0, color: this.colores[indice % this.colores.length] }));
  });
  readonly motivoPrincipal = computed(() => this.categorias()[0] ?? null);
  readonly maximoCategoria = computed(() => Math.max(1, ...this.categorias().map(fila => this.verMonto() ? fila.monto : fila.cantidad)));
  // La tendencia conserva el año completo para comparar meses aunque se filtre uno.
  readonly tendencia = computed(() => {
    const motivos = [...new Set(this.registrosAnuales().map(fila => fila.motivo))];
    const series = motivos.map((motivo, indice) => ({ motivo, color: this.colores[indice % this.colores.length], valores: this.meses.map((_, mes) => this.registrosAnuales().filter(fila => fila.motivo === motivo && Number(fila.mes.slice(5, 7)) === mes + 1).reduce((suma, fila) => suma + (this.verMonto() ? fila.monto : fila.cantidad), 0)) }));
    const maximo = Math.max(1, ...series.flatMap(serie => serie.valores));
    return { maximo, series: series.map(serie => ({ ...serie, puntos: serie.valores.map((valor, mes) => `${45 + mes * 39},${190 - valor / maximo * 160}`).join(' ') })) };
  });

  buscar(): void {
    this.filtros.set({ mes: this.mesSeleccionado, anio: Number(this.anioSeleccionado) });
  }

  limpiar(): void {
    this.mesSeleccionado = '';
    this.anioSeleccionado = new Date().getFullYear();
    this.verMonto.set(false);
    this.buscar();
  }
}
