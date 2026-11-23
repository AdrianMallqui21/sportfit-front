import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import { ReservaModelo } from '../../../modelos/solicitud-reserva-modelo';
import { SedeCanchaModelo, SedeModelo, TipoCanchaModelo } from '../../../modelos/espacio-deportivo-modelo';
import { ClienteModelo } from '../../../modelos/cliente-modelo';
import { ReservaServicio } from '../../../servicios/reserva-servicio';
import { A20ConfirmarEdicionDialogo } from '../a20-confirmar-edicion-dialogo/a20-confirmar-edicion-dialogo';

export interface DatosEditarReservaDialogo {
  reserva: ReservaModelo;
  todasReservas: ReservaModelo[];
  canchas: SedeCanchaModelo[];
  sedes: SedeModelo[];
  tiposCancha: TipoCanchaModelo[];
  clientes: ClienteModelo[];
}

interface DiaSemanaCalendario {
  fechaIso: string;
  etiqueta: string;
}

interface CeldaCalendario {
  fechaIso: string;
  hora: string;
  estado: 'confirmada' | 'pendiente' | 'disponible';
  cliente?: string;
  esActual?: boolean;
  esNuevaSeleccion?: boolean;
  rangoTexto?: string;
}

@Component({
  selector: 'app-a19-editar-reserva-dialogo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogClose,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDatepickerModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
  templateUrl: './a19-editar-reserva-dialogo.html',
  styleUrl: './a19-editar-reserva-dialogo.css'
})
export class A19EditarReservaDialogo implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reservaServicio = inject(ReservaServicio);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<A19EditarReservaDialogo>);
  readonly data: DatosEditarReservaDialogo = inject(MAT_DIALOG_DATA);

  formEdicion: FormGroup;
  horasCalendario: string[] = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  diasSemana = signal<DiaSemanaCalendario[]>([]);
  canchaEdicionId = signal<number>(0);
  mensajeValidacion = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  guardando = signal<boolean>(false);

  private duracionOriginalHoras = 1;

  constructor() {
    const r = this.data.reserva;
    const idCancha = this.obtenerIdSedeCancha(r) || null;
    this.canchaEdicionId.set(idCancha || 0);

    const hIni = this.formatearHora(r.hInicio);
    const hFin = this.formatearHora(r.hFin);
    const diff = Math.round((this.normalizarHoraMinutos(hFin) - this.normalizarHoraMinutos(hIni)) / 60);
    this.duracionOriginalHoras = diff > 0 ? diff : 1;

    this.formEdicion = this.fb.group({
      idSedeCancha: [idCancha, Validators.required],
      fReserva: [r.fReserva || '', Validators.required],
      hInicio: [hIni, Validators.required],
      hFin: [hFin, Validators.required],
      estado: [(r.estado || 'solicitada').toLowerCase(), Validators.required],
      reservadoPor: [{ value: this.obtenerNombreCliente(r), disabled: true }]
    });
  }

  ngOnInit(): void {
    this.actualizarSemanaCalendario(this.formEdicion.get('fReserva')?.value);
    this.validarEnTiempoReal();

    this.formEdicion.valueChanges.subscribe(() => {
      const idCancha = Number(this.formEdicion.get('idSedeCancha')?.value || 0);
      this.canchaEdicionId.set(idCancha);
      this.validarEnTiempoReal();
    });
  }

  alCambiarFecha(): void {
    const f = this.convertirFechaAISO(this.formEdicion.get('fReserva')?.value);
    if (f) {
      if (this.formEdicion.get('fReserva')?.value !== f) {
        this.formEdicion.patchValue({ fReserva: f }, { emitEvent: false });
      }
      this.actualizarSemanaCalendario(f);
    }
    this.validarEnTiempoReal();
  }

  cambiarSemana(deltaDias: number): void {
    const actualDias = this.diasSemana();
    const baseStr = actualDias.length > 0 ? actualDias[0].fechaIso : this.formEdicion.get('fReserva')?.value;
    const base = baseStr ? new Date(`${baseStr}T00:00:00`) : new Date();
    base.setDate(base.getDate() + deltaDias);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, '0');
    const dd = String(base.getDate()).padStart(2, '0');
    this.actualizarSemanaCalendario(`${yyyy}-${mm}-${dd}`);
  }

  private actualizarSemanaCalendario(fechaBaseStr: string): void {
    const iso = this.convertirFechaAISO(fechaBaseStr);
    const fechaBase = iso ? new Date(`${iso}T00:00:00`) : new Date();
    const diaSemana = fechaBase.getDay();
    const diffALunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(fechaBase);
    lunes.setDate(fechaBase.getDate() + diffALunes);

    const nombresDias = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const semana: DiaSemanaCalendario[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      semana.push({
        fechaIso: `${yyyy}-${mm}-${dd}`,
        etiqueta: `${nombresDias[i]} ${dd}`
      });
    }
    this.diasSemana.set(semana);
  }

  obtenerCeldaCalendario(fechaIso: string, horaSlot: string): CeldaCalendario {
    const idCancha = this.canchaEdicionId();
    const idActual = this.data.reserva.idReserva;
    const horaNum = parseInt(horaSlot.split(':')[0], 10);

    const val = this.formEdicion.getRawValue();
    const selFecha = this.convertirFechaAISO(val.fReserva);
    const selIni = Math.floor(this.normalizarHoraMinutos(val.hInicio) / 60);
    const selFin = Math.ceil(this.normalizarHoraMinutos(val.hFin) / 60);
    const esNuevaSeleccion = selFecha === fechaIso && horaNum >= selIni && horaNum < selFin;

    const coincidencia = this.data.todasReservas.find(r => {
      if (idCancha > 0 && this.obtenerIdSedeCancha(r) !== idCancha) return false;
      if (r.fReserva !== fechaIso) return false;
      const est = (r.estado || '').toLowerCase();
      if (est === 'cancelada' || est === 'rechazada') return false;
      const ini = parseInt((r.hInicio || '00:00').split(':')[0], 10);
      const fin = parseInt((r.hFin || '00:00').split(':')[0], 10);
      return horaNum >= ini && horaNum < fin;
    });

    if (coincidencia) {
      const est = (coincidencia.estado || '').toLowerCase();
      return {
        fechaIso,
        hora: horaSlot,
        estado: est === 'confirmada' ? 'confirmada' : 'pendiente',
        cliente: this.obtenerNombreCliente(coincidencia),
        esActual: idActual === coincidencia.idReserva,
        esNuevaSeleccion,
        rangoTexto: `${this.formatearHora(coincidencia.hInicio)} - ${this.formatearHora(coincidencia.hFin)}`
      };
    }

    return {
      fechaIso,
      hora: horaSlot,
      estado: 'disponible',
      esNuevaSeleccion
    };
  }

  seleccionarSlotCalendario(celda: CeldaCalendario): void {
    if (celda.estado !== 'disponible' && !celda.esActual) {
      this.mensajeValidacion.set({
        tipo: 'error',
        texto: `Horario ocupado por ${celda.cliente} (${celda.rangoTexto}). Elige una celda blanca disponible.`
      });
      return;
    }

    const horaIniNum = parseInt(celda.hora.split(':')[0], 10);
    const horaFinNum = Math.min(23, horaIniNum + this.duracionOriginalHoras);
    const hFinStr = `${String(horaFinNum).padStart(2, '0')}:00`;

    this.formEdicion.patchValue({
      fReserva: celda.fechaIso,
      hInicio: celda.hora,
      hFin: hFinStr
    });
    this.validarEnTiempoReal();
  }

  validarEnTiempoReal(): boolean {
    if (this.formEdicion.invalid) {
      this.mensajeValidacion.set({
        tipo: 'error',
        texto: 'Completa cancha, fecha, hora de inicio y hora de fin.'
      });
      return false;
    }

    const val = this.formEdicion.getRawValue();
    const fechaIso = this.convertirFechaAISO(val.fReserva);
    if (!fechaIso) {
      this.mensajeValidacion.set({ tipo: 'error', texto: 'Ingresa una fecha válida.' });
      return false;
    }

    const hIni = this.normalizarHoraMinutos(val.hInicio);
    const hFin = this.normalizarHoraMinutos(val.hFin);
    if (hIni >= hFin) {
      this.mensajeValidacion.set({
        tipo: 'error',
        texto: 'La hora de fin debe ser mayor que la hora de inicio.'
      });
      return false;
    }

    const idActual = this.data.reserva.idReserva;
    const idCancha = Number(val.idSedeCancha);
    const conflicto = this.data.todasReservas.find(r => {
      if (r.idReserva === idActual) return false;
      if (this.obtenerIdSedeCancha(r) !== idCancha) return false;
      if (r.fReserva !== fechaIso) return false;
      const est = (r.estado || '').toLowerCase();
      if (est === 'cancelada' || est === 'rechazada') return false;

      const rIni = this.normalizarHoraMinutos(r.hInicio);
      const rFin = this.normalizarHoraMinutos(r.hFin);
      return hIni < rFin && hFin > rIni;
    });

    if (conflicto) {
      this.mensajeValidacion.set({
        tipo: 'error',
        texto: `Cruce de horario con ${this.obtenerNombreCliente(conflicto)} (${this.formatearHora(conflicto.hInicio)} - ${this.formatearHora(conflicto.hFin)}).`
      });
      return false;
    }

    this.mensajeValidacion.set({
      tipo: 'ok',
      texto: `Horario disponible (${fechaIso} de ${val.hInicio} a ${val.hFin}). Listo para actualizar.`
    });
    return true;
  }

  solicitarConfirmacion(): void {
    if (!this.validarEnTiempoReal()) {
      this.formEdicion.markAllAsTouched();
      return;
    }

    const val = this.formEdicion.getRawValue();
    const fechaIso = this.convertirFechaAISO(val.fReserva) || val.fReserva;
    const canchaObj = this.data.canchas.find(c => c.idSedeCancha === Number(val.idSedeCancha));
    const canchaNombre = canchaObj
      ? `${this.buscarNombreSede(canchaObj.idSedeSede)} - ${this.buscarNombreDeporte(canchaObj.idTipoCancha)} (${canchaObj.nombre})`
      : '';

    const ref = this.dialog.open(A20ConfirmarEdicionDialogo, {
      width: '430px',
      maxWidth: '95vw',
      data: {
        canchaNombre,
        fecha: fechaIso,
        horario: `${val.hInicio} - ${val.hFin}`
      }
    });

    ref.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.ejecutarActualizacion(fechaIso);
      }
    });
  }

  private ejecutarActualizacion(fechaIso: string): void {
    const actual = this.data.reserva;
    const val = this.formEdicion.getRawValue();
    const idUsuario = actual.usuario?.idUsuario ?? (actual as any).idUsuario;

    const payload: any = {
      idReserva: actual.idReserva,
      fReserva: fechaIso,
      hInicio: this.asegurarFormatoSegundos(val.hInicio),
      hFin: this.asegurarFormatoSegundos(val.hFin),
      estado: val.estado,
      modificadoPor: 'admin@sportfit.com',
      idUsuario,
      idSedeCancha: Number(val.idSedeCancha),
      sedeCancha: { idSedeCancha: Number(val.idSedeCancha) }
    };

    this.guardando.set(true);
    this.reservaServicio.editarReserva(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogRef.close(true);
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        const msg = (err instanceof HttpErrorResponse && err.error?.message)
          ? err.error.message
          : 'No se pudo actualizar la reserva en el servidor.';
        this.mensajeValidacion.set({ tipo: 'error', texto: msg });
      }
    });
  }

  // Helpers
  obtenerIdSedeCancha(r: ReservaModelo): number {
    return r.sedeCancha?.idSedeCancha ?? (r as any).idSedeCancha ?? 0;
  }

  buscarNombreSede(idSede?: number | null): string {
    if (!idSede) return '';
    return this.data.sedes.find(s => s.idSede === idSede)?.nombre || '';
  }

  buscarNombreDeporte(idTipoCancha?: number | null): string {
    if (!idTipoCancha) return '';
    return this.data.tiposCancha.find(t => t.idTipoCancha === idTipoCancha)?.deporte || '';
  }

  obtenerNombreCliente(r: ReservaModelo): string {
    if (r.usuario) {
      const full = `${r.usuario.nombre || ''} ${r.usuario.apellido || ''}`.trim();
      if (full) return full;
      if (r.usuario.correo) return r.usuario.correo;
    }
    const idUser = (r as any).idUsuario;
    if (idUser) {
      const cli = this.data.clientes.find(u => u.idUsuario === idUser);
      if (cli) return `${cli.nombre || ''} ${cli.apellido || ''}`.trim() || cli.correo;
    }
    return 'Cliente';
  }

  formatearHora(hora?: string): string {
    return hora ? hora.slice(0, 5) : '08:00';
  }

  private normalizarHoraMinutos(hora: string): number {
    const [h, m] = (hora || '00:00').split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private asegurarFormatoSegundos(hora: string): string {
    if (!hora) return '00:00:00';
    return hora.length === 5 ? `${hora}:00` : hora;
  }

  private convertirFechaAISO(valor: Date | string | null): string | null {
    if (!valor) return null;
    if (valor instanceof Date && !isNaN(valor.getTime())) {
      const y = valor.getFullYear();
      const m = String(valor.getMonth() + 1).padStart(2, '0');
      const d = String(valor.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof valor === 'string') {
      const texto = valor.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
    }
    return null;
  }
}
