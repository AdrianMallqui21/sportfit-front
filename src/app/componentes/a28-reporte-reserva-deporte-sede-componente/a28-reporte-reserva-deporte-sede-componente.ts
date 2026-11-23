import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { catchError, combineLatest, map, Observable, of, startWith, switchMap } from 'rxjs';
import { PagoServicio } from '../../servicios/pago-servicio';
import { ReservaServicio } from '../../servicios/reserva-servicio';

function consultar<T>(peticion: Observable<T>) {
  return peticion.pipe(
    map(datos => ({ datos, estado: 'listo' as const })),
    catchError(() => of({ datos: null, estado: 'error' as const })),
    startWith({ datos: null, estado: 'cargando' as const }),
  );
}

function cambios<T>(control: FormControl<T>) {
  return control.valueChanges.pipe(startWith(control.value));
}

@Component({
  selector: 'app-a28-reporte-reserva-deporte-sede-componente',
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule,
    MatSelectModule, MatTableModule, CurrencyPipe, PercentPipe],
  templateUrl: './a28-reporte-reserva-deporte-sede-componente.html',
  styleUrl: './a28-reporte-reserva-deporte-sede-componente.css',
})
export class A28ReporteReservaDeporteSedeComponente {
  private readonly reservas = inject(ReservaServicio);
  private readonly pagos = inject(PagoServicio);
  private readonly hoy = new Date();

  readonly meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  readonly anios = [this.hoy.getFullYear(), this.hoy.getFullYear() - 1, this.hoy.getFullYear() - 2];
  readonly mesBarras = new FormControl<number>(this.hoy.getMonth() + 1, { nonNullable: true });
  readonly anioTendencia = new FormControl(this.hoy.getFullYear(), { nonNullable: true });
  readonly mesDetalle = new FormControl(this.hoy.getMonth() + 1, { nonNullable: true });
  readonly anioDetalle = new FormControl(this.hoy.getFullYear(), { nonNullable: true });
  readonly sedeDetalle = new FormControl<number | null>(null);
  readonly columnas = ['sede', 'deporte', 'cantidad', 'ingresos'];
  private readonly colores = ['#3a7847', '#625dd5', '#ed8b00', '#a330e7', '#008b9d', '#bf436e'];

  readonly banners = toSignal(consultar(this.reservas.cargarBannerReservas()));
  readonly participacion = toSignal(consultar(this.reservas.listarDeporteParticipacion()));
  readonly sedes = toSignal(consultar(this.reservas.listarSedes()));
  readonly frecuencia = toSignal(cambios(this.mesBarras).pipe(
    switchMap(mes => consultar(this.reservas.frecuenciaReservasPorDeporteSede(mes || undefined))),
  ));
  readonly tendencia = toSignal(cambios(this.anioTendencia).pipe(
    switchMap(anio => consultar(this.reservas.listarTendenciaAnual(anio))),
  ));
  readonly detalle = toSignal(combineLatest([
    cambios(this.mesDetalle), cambios(this.anioDetalle), cambios(this.sedeDetalle),
  ]).pipe(switchMap(([mes, anio, sede]) => consultar(this.pagos.listarDetalleSede(mes, anio, sede ?? undefined)))));

  private readonly deportes = computed(() => [...new Set([
    ...(this.participacion()?.datos ?? []).map(fila => fila.deporte),
    ...(this.frecuencia()?.datos ?? []).map(fila => fila.deporte),
    ...(this.tendencia()?.datos ?? []).map(fila => fila.deporte),
  ])]);

  color(deporte: string) {
    return this.colores[this.deportes().indexOf(deporte) % this.colores.length];
  }

  readonly total = computed(() => (this.participacion()?.datos ?? []).reduce((total, fila) => total + fila.cantidad, 0));
  readonly dona = computed(() => {
    let inicio = 0;
    const segmentos = (this.participacion()?.datos ?? []).map(fila => {
      const fin = inicio + fila.cantidad / (this.total() || 1) * 100;
      const segmento = `${this.color(fila.deporte)} ${inicio}% ${fin}%`;
      inicio = fin;
      return segmento;
    });
    return segmentos.length && this.total() ? `conic-gradient(${segmentos.join(', ')})` : '#e8eee9';
  });

  readonly graficoBarras = computed(() => {
    const filas = this.frecuencia()?.datos ?? [];
    const sedes = [...new Set(filas.map(fila => fila.sede))];
    const deportes = [...new Set(filas.map(fila => fila.deporte))];
    const anchoGrupo = 510 / Math.max(1, sedes.length);
    const ancho = anchoGrupo * .8 / Math.max(1, deportes.length);
    const maximo = Math.max(1, ...filas.map(fila => fila.frecuencia));
    return {
      deportes, maximo,
      etiquetas: sedes.map((sede, i) => ({ sede, x: 48 + anchoGrupo * (i + .5) })),
      barras: filas.map(fila => ({
        ...fila, ancho: Math.max(1, ancho - 2),
        x: 48 + sedes.indexOf(fila.sede) * anchoGrupo + anchoGrupo * .1 + deportes.indexOf(fila.deporte) * ancho,
        alto: fila.frecuencia / maximo * 150,
      })),
    };
  });

  readonly graficoTendencia = computed(() => {
    const filas = this.tendencia()?.datos ?? [];
    const maximo = Math.max(1, ...filas.map(fila => fila.cantidad));
    const deportes = [...new Set(filas.map(fila => fila.deporte))];
    return {
      maximo,
      series: deportes.map(deporte => {
        const puntos = this.meses.map((_, i) => {
          const cantidad = filas.find(fila => fila.deporte === deporte && fila.mes === i + 1)?.cantidad ?? 0;
          return { x: 48 + i * 45, y: 170 - cantidad / maximo * 150, cantidad };
        });
        return { deporte, puntos, linea: puntos.map(punto => `${punto.x},${punto.y}`).join(' ') };
      }),
    };
  });

  escala(marca: number, maximo: number): string {
    return (marca * maximo / 5).toLocaleString('es-PE', { maximumFractionDigits: 1 });
  }

  exportar(): void {
    const filas = this.detalle()?.datos ?? [];
    const celda = (valor: string | number) => {
      const texto = typeof valor === 'string' && /^\s*[=+@-]/.test(valor) ? "'" + valor : String(valor);
      return '"' + texto.replaceAll('"', '""') + '"';
    };
    const csv = [
      ['Sede', 'Deporte', 'Reservas', 'Ingresos'],
      ...filas.map(fila => [fila.sede, fila.deporte, fila.cantidad, fila.ingresos]),
    ].map(fila => fila.map(celda).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'detalle-reservas.csv';
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

