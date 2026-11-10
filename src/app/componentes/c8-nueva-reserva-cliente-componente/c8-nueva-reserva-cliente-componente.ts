import { Component } from '@angular/core';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { MatCard } from '@angular/material/card';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCell, MatCellDef, MatColumnDef, MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef, MatTable } from '@angular/material/table';
import { DecimalPipe, NgForOf } from '@angular/common';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInput } from '@angular/material/input';


interface Cancha {
  id: string;
  precioHora: number;
  aforo: number;
  horasOcupadas: number[];
}

@Component({
  imports: [
    BarraLateral,
    MatCard,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatNativeDateModule,
    MatSuffix,
    MatSelect,
    MatOption,
    MatButton,
    MatIcon,
    MatIconButton,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    DecimalPipe,
    MatRowDef,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderCellDef,
    NgForOf,
  ],
  selector: 'app-c8-nueva-reserva-cliente-componente',
  styleUrl: './c8-nueva-reserva-cliente-componente.css',
  templateUrl: './c8-nueva-reserva-cliente-componente.html',
})
export class C8NuevaReservaClienteComponente {
  fechaSeleccionada = new Date();
  deporteSeleccionado = '';
  sedeSeleccionada = '';

  canchaSeleccionada = '';
  horaSeleccionada: number | null = null;

  readonly horarios = Array.from({ length: 15 }, (_, indice) => {
    const hora = indice + 8;
    const etiqueta = `${String(hora).padStart(2, '0')}:00`;

    return {
      id: `hora${String(hora).padStart(2, '0')}`,
      etiqueta,
      indice,
    };
  });

  readonly displayedColumns = [
    'cancha',
    'precio',
    'aforo',
    ...this.horarios.map((horario) => horario.id),
  ];

  // Datos de muestra: reemplázalos por la respuesta de tus endpoints.
  readonly dataSource: Cancha[] = [
    {
      id: 'C01',
      precioHora: 25,
      aforo: 20,
      horasOcupadas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
    { id: 'C02', precioHora: 25, aforo: 20, horasOcupadas: [3, 4, 5, 6, 9, 10, 11, 12] },
    { id: 'C03', precioHora: 45, aforo: 30, horasOcupadas: [10, 11, 12] },
    { id: 'C04', precioHora: 45, aforo: 30, horasOcupadas: [2, 3, 6, 7, 8] },
    { id: 'C05', precioHora: 25, aforo: 20, horasOcupadas: [0, 1, 2, 3, 6, 8, 9, 10, 11, 12, 13] },
    { id: 'C06', precioHora: 45, aforo: 30, horasOcupadas: [1, 2, 3, 4, 9, 10, 11, 12, 13] },
    { id: 'C07', precioHora: 45, aforo: 30, horasOcupadas: [4, 5, 6, 7, 8, 10, 11, 12, 13] },
    { id: 'C08', precioHora: 25, aforo: 20, horasOcupadas: [10, 11, 12, 13] },
    { id: 'C09', precioHora: 25, aforo: 20, horasOcupadas: [] },
    { id: 'C10', precioHora: 25, aforo: 20, horasOcupadas: [9, 10, 11, 12] },
  ];

  get fechaAnterior(): Date {
    return this.moverFecha(this.fechaSeleccionada, -1);
  }

  get fechaSiguiente(): Date {
    return this.moverFecha(this.fechaSeleccionada, 1);
  }

  get horaInicioSeleccionada(): string | null {
    if (this.horaSeleccionada === null) return null;
    return this.horarios[this.horaSeleccionada].etiqueta;
  }

  get horaFinSeleccionada(): string | null {
    if (this.horaSeleccionada === null) return null;
    return this.horarios[this.horaSeleccionada + 1]?.etiqueta ?? null;
  }

  get precioSeleccionado(): number | null {
    const cancha = this.dataSource.find((item) => item.id === this.canchaSeleccionada);
    return cancha?.precioHora ?? null;
  }

  formatearFecha(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${fecha.getFullYear()}`;
  }

  cambiarFecha(fecha: Date | null): void {
    if (!fecha) return;

    this.fechaSeleccionada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    this.limpiarHorario();
  }

  seleccionarFechaRapida(dias: number): void {
    this.fechaSeleccionada = this.moverFecha(this.fechaSeleccionada, dias);
    this.limpiarHorario();
  }

  desplazarDia(dias: number): void {
    this.seleccionarFechaRapida(dias);
  }

  estaOcupado(cancha: Cancha, indice: number): boolean {
    return indice === this.horarios.length - 1 || cancha.horasOcupadas.includes(indice);
  }

  colorDisponibilidad(cancha: Cancha, indice: number): string {
    if (this.canchaSeleccionada === cancha.id && this.horaSeleccionada === indice) {
      return '#40b983';
    }

    return this.estaOcupado(cancha, indice) ? '#ff6464' : '#eeeeee';
  }

  seleccionarHorario(cancha: Cancha, indice: number): void {
    if (this.estaOcupado(cancha, indice)) return;

    this.canchaSeleccionada = cancha.id;
    this.horaSeleccionada = indice;
  }

  limpiarFiltros(): void {
    this.deporteSeleccionado = '';
    this.sedeSeleccionada = '';
    this.fechaSeleccionada = new Date();
    this.limpiarHorario();
  }

  private limpiarHorario(): void {
    this.canchaSeleccionada = '';
    this.horaSeleccionada = null;
  }

  private moverFecha(fecha: Date, dias: number): Date {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha;
  }

  // Completa estas funciones cuando conectes tus diálogos o servicios.
  verDetallesCancha(): void {}
  buscarDisponibilidad(): void {}
  solicitarReserva(): void {}
}
