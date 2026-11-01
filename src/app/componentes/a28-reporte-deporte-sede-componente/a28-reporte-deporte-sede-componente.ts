import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Contrato del reporte: una fila por mes, sede y deporte. Sin datos simulados.
export interface RegistroReporteReservas {
  mes: string; // YYYY-MM
  sede: string;
  deporte: string;
  reservas: number;
  ingresos: number;
}

@Component({
  selector: 'app-a28-reporte-deporte-sede-componente',
  imports: [FormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './a28-reporte-deporte-sede-componente.html',
  styleUrl: './a28-reporte-deporte-sede-componente.css',
})
export class A28ReporteDeporteSedeComponente {
  // Al conectar el backend, actualizar esta señal con los registros recibidos.
  readonly registros = signal<RegistroReporteReservas[]>([]);
  readonly sedeSeleccionada = signal('');
  readonly anioSeleccionado = signal(new Date().getFullYear());
  readonly mesesSeleccionados = signal(12);
  readonly metrica = signal<'reservas' | 'ingresos'>('reservas');
  readonly colores = ['#39b985', '#6260d4', '#ff9900', '#aa20ed', '#049fb0', '#bb689b'];
  readonly meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  readonly sedes = computed(() => [...new Set(this.registros().map(fila => fila.sede))].sort());
  readonly anios = computed(() => [...new Set([new Date().getFullYear(), ...this.registros().map(fila => Number(fila.mes.slice(0, 4)))])].sort((a, b) => b - a));
  readonly filtrados = computed(() => {
    const anio = this.anioSeleccionado();
    const ultimoMes = anio === new Date().getFullYear() ? new Date().getMonth() + 1 : 12;
    const limite = anio * 12 + ultimoMes - 1;
    return this.registros().filter(fila => {
      const [a, m] = fila.mes.split('-').map(Number);
      const indice = a * 12 + m - 1;
      return indice <= limite && indice > limite - this.mesesSeleccionados() &&
        (!this.sedeSeleccionada() || fila.sede === this.sedeSeleccionada());
    });
  });
  readonly totalReservas = computed(() => this.filtrados().reduce((total, fila) => total + fila.reservas, 0));
  readonly reservasMes = computed(() => {
    const fecha = new Date();
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    return this.filtrados().filter(fila => fila.mes === mes).reduce((total, fila) => total + fila.reservas, 0);
  });
  readonly porDeporte = computed(() => this.agrupar(this.filtrados(), 'deporte'));
  readonly porSede = computed(() => this.agrupar(this.filtrados(), 'sede'));
  readonly deportePrincipal = computed(() => this.porDeporte().reduce<{ nombre: string; reservas: number } | null>((mayor, fila) => !mayor || fila.reservas > mayor.reservas ? fila : mayor, null)?.nombre ?? '—');
  readonly sedePrincipal = computed(() => this.porSede().reduce<{ nombre: string; reservas: number } | null>((mayor, fila) => !mayor || fila.reservas > mayor.reservas ? fila : mayor, null)?.nombre ?? '—');
  readonly detalle = computed(() => {
    const grupos = new Map<string, { sede: string; deporte: string; reservas: number; ingresos: number }>();
    for (const fila of this.filtrados()) {
      const clave = JSON.stringify([fila.sede, fila.deporte]);
      const grupo = grupos.get(clave) ?? { sede: fila.sede, deporte: fila.deporte, reservas: 0, ingresos: 0 };
      grupo.reservas += fila.reservas;
      grupo.ingresos += fila.ingresos;
      grupos.set(clave, grupo);
    }
    return [...grupos.values()];
  });
  readonly barras = computed(() => {
    const filas = this.detalle();
    const maximo = Math.max(1, ...filas.map(fila => fila[this.metrica()]));
    return filas.map((fila, indice) => ({ ...fila, valor: fila[this.metrica()], altura: fila[this.metrica()] / maximo * 135, x: 35 + indice * 440 / filas.length, ancho: Math.max(1, 440 / filas.length - 8), color: this.colorDeporte(fila.deporte) }));
  });
  readonly participaciones = computed(() => {
    let acumulado = 0;
    return this.porDeporte().map((fila, indice) => {
      const porcentaje = this.totalReservas() ? fila.reservas / this.totalReservas() * 100 : 0;
      const segmento = { ...fila, porcentaje, inicio: acumulado, color: this.colores[indice % this.colores.length] };
      acumulado += porcentaje;
      return segmento;
    });
  });
  readonly maximoSede = computed(() => Math.max(1, ...this.porSede().map(fila => fila.reservas)));
  readonly tendencia = computed(() => {
    const fecha = new Date();
    const fin = this.anioSeleccionado() === fecha.getFullYear() ? fecha.getMonth() : 11;
    const periodos = Array.from({ length: this.mesesSeleccionados() }, (_, indice) => {
      const mes = new Date(this.anioSeleccionado(), fin - this.mesesSeleccionados() + 1 + indice, 1);
      return { clave: `${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, '0')}`, etiqueta: `${this.meses[mes.getMonth()]} ${String(mes.getFullYear()).slice(2)}` };
    });
    const series = this.porDeporte().map((deporte, indice) => ({ nombre: deporte.nombre, color: this.colores[indice % this.colores.length], valores: periodos.map(mes => this.filtrados().filter(fila => fila.mes === mes.clave && fila.deporte === deporte.nombre).reduce((total, fila) => total + fila.reservas, 0)) }));
    const maximo = Math.max(1, ...series.flatMap(serie => serie.valores));
    return { periodos, maximo, series: series.map(serie => ({ ...serie, puntos: serie.valores.map((valor, indice) => `${40 + indice * 470 / Math.max(1, periodos.length - 1)},${165 - valor / maximo * 140}`).join(' ') })) };
  });

  private agrupar(filas: RegistroReporteReservas[], campo: 'sede' | 'deporte') {
    const grupos = new Map<string, number>();
    for (const fila of filas) grupos.set(fila[campo], (grupos.get(fila[campo]) ?? 0) + fila.reservas);
    return [...grupos].map(([nombre, reservas]) => ({ nombre, reservas }));
  }

  colorDeporte(deporte: string): string {
    return this.colores[this.porDeporte().findIndex(fila => fila.nombre === deporte) % this.colores.length];
  }

  exportarReporte(): void {
    if (!this.detalle().length) return;
    const celda = (valor: string | number) => `"${String(valor).replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
    const contenido = [['Sede', 'Deporte', 'Reservas', 'Ingresos'], ...this.detalle().map(fila => [fila.sede, fila.deporte, fila.reservas, fila.ingresos])].map(fila => fila.map(celda).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', contenido], { type: 'text/csv;charset=utf-8;' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'reservas-por-deporte-y-sede.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
