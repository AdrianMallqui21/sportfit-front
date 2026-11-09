import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import { ReservaHome, SedeCanchaHome, SedeHome, TipoCanchaHome, } from '../../modelos/home-cliente-modelo';

@Component({
  selector: 'app-c4-home-cliente-componente',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    BarraLateral,
  ],
  templateUrl: './c4-home-cliente-componente.html',
  styleUrl: './c4-home-cliente-componente.css',
})
export class C4HomeClienteComponente {
  //injectamos al servicio que contiene la llamada a las apis
  private homeServicio = inject(ClienteServicio);
  private detector = inject(ChangeDetectorRef);

  nombre: string = 'Cliente';
  realizadas: number = 0;
  canceladas: number = 0;
  proximas: ReservaHome[] = [];
  solicitadas: ReservaHome[] = [];
  canchas: SedeCanchaHome[] = [];
  sedes: SedeHome[] = [];
  tiposCancha: TipoCanchaHome[] = [];
  columnas: string[] = ['cancha', 'sede', 'fecha', 'hora']; //Lo que mostramos en tabla
  meses: string[] = [];
  puntos: { x: number; y: number }[] = [];
  puntosGrafico: string = '';
  tieneActividad: boolean = false;
  error: string = '';

  constructor() {}

  //Llamos las funcionalidades cuando angular se ejecuta
  ngOnInit() {
    this.obtenerUsuario();
    this.obtenerCanchas();
    this.obtenerSedes();
    this.obtenerTiposCancha();
  }


  obtenerUsuario() {
    const correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));

    if (!correo || !idRol) {
      this.error = 'No se encontraron los datos del usuario.';
      this.detector.markForCheck();
      return;
    }

    this.homeServicio.obtenerUsuario(correo, idRol).subscribe({
      next: (data) => {
        console.log('USUARIO RECIBIDO:', data);

        this.nombre = data.nombre;

        this.obtenerReservas(data.idUsuario);
        this.obtenerProximas(data.idUsuario);
        this.obtenerSolicitadas(data.idUsuario);

        this.detector.markForCheck();
      },
      error: (error) => {
        console.log('ERROR AL OBTENER USUARIO:', error);
        this.error = 'No se pudo obtener el usuario.';
        this.detector.markForCheck();
      }
    });
  }


  obtenerReservas(idUsuario: number) {
    this.homeServicio.obtenerReservas(idUsuario).subscribe({
      next: (data) => {
        this.realizadas = 0;
        this.canceladas = 0;

        for (const reserva of data) {
          this.normalizarReserva(reserva);

          if (reserva.estado?.toLowerCase() === 'completada') {
            this.realizadas++;
          }

          if (reserva.estado?.toLowerCase() === 'cancelada') {
            this.canceladas++;
          }
        }
        this.crearGrafico(data);
        this.detector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron obtener las reservas.';
      },
    });
  }

  obtenerProximas(idUsuario: number) {
    this.homeServicio.obtenerProximas(idUsuario).subscribe({
      next: (data) => {
        console.log('RESERVAS DEL BACKEND:', data);
        this.proximas = data;
        for (const reserva of this.proximas) {
          this.normalizarReserva(reserva);
        }
        this.detector.markForCheck();
      },
      error: (error) => {
        console.error('ERROR RESERVAS:', error);
        this.error = 'No se pudieron obtener las próximas reservas.';
        this.detector.markForCheck();
      },
    });
  }

  obtenerSolicitadas(idUsuario: number) {
    this.homeServicio.obtenerSolicitadas(idUsuario).subscribe({
      next: (data) => {
        this.solicitadas = data;

        for (const reserva of this.solicitadas) {
          this.normalizarReserva(reserva);
        }
        this.detector.markForCheck();
      },
      error: () => {
        this.error = 'No se pudieron obtener las solicitudes.';
        this.detector.markForCheck();
      },
    });
  }

  obtenerCanchas() {
    this.homeServicio.obtenerCanchas().subscribe((data) => {
      this.canchas = data;
    });
  }

  obtenerSedes() {
    this.homeServicio.obtenerSedes().subscribe((data) => {
      this.sedes = data;
    });
  }

  obtenerTiposCancha() {
    this.homeServicio.obtenerTiposCancha().subscribe((data) => {
      this.tiposCancha = data;
    });
  }

  normalizarReserva(reserva: ReservaHome) {
    reserva.fReserva = reserva.fReserva || reserva.freserva || '';
    reserva.hInicio = reserva.hInicio || reserva.hinicio || '';
    reserva.hFin = reserva.hFin || reserva.hfin || '';
  }

  nombreCancha(idSedeCancha: number): string {
    for (const cancha of this.canchas) {
      if (cancha.idSedeCancha === idSedeCancha) {
        return cancha.nombre;
      }
    }
    return 'Cancha ' + idSedeCancha;
  }

  nombreDeporte(idSedeCancha: number): string {
    for (const cancha of this.canchas) {
      if (cancha.idSedeCancha === idSedeCancha) {
        for (const tipo of this.tiposCancha) {
          if (tipo.idTipoCancha === cancha.idTipoCancha) {
            return tipo.deporte;
          }
        }
      }
    }
    return '—';
  }

  nombreSede(idSedeCancha: number): string {
    for (const cancha of this.canchas) {
      if (cancha.idSedeCancha === idSedeCancha) {
        for (const sede of this.sedes) {
          if (sede.idSede === cancha.idSedeSede) {
            return sede.distrito || sede.nombre;
          }
        }
      }
    }
    return '—';
  }

  hora(reserva: ReservaHome): string {
    return (reserva.hInicio || '—').slice(0, 5) + ' - ' + (reserva.hFin || '—').slice(0, 5);
  }

  crearGrafico(reservas: ReservaHome[]) {
    const nombresMeses = [
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
    const hoy = new Date();
    const horasMes: number[] = [];

    this.meses = [];
    this.puntos = [];
    this.puntosGrafico = '';
    this.tieneActividad = false;

    for (let i = 5; i >= 0; i--) {
      const mes = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);

      this.meses.push(nombresMeses[mes.getMonth()]);

      let horas = 0;

      for (const reserva of reservas) {
        if (reserva.estado?.toLowerCase() !== 'completada') {
          continue;
        }

        if (!reserva.fReserva || !reserva.hInicio || !reserva.hFin) {
          continue;
        }

        const fecha = reserva.fReserva.split('-');

        if (Number(fecha[0]) !== mes.getFullYear() || Number(fecha[1]) !== mes.getMonth() + 1) {
          continue;
        }

        const inicio = reserva.hInicio.split(':');
        const fin = reserva.hFin.split(':');

        const minutos =
          Number(fin[0]) * 60 + Number(fin[1]) - Number(inicio[0]) * 60 - Number(inicio[1]);

        if (minutos > 0) {
          horas += minutos / 60;
        }
      }

      horasMes.push(horas);

      if (horas > 0) {
        this.tieneActividad = true;
      }
    }

    let maximo = 1;

    for (const horas of horasMes) {
      if (horas > maximo) {
        maximo = horas;
      }
    }

    for (let i = 0; i < horasMes.length; i++) {
      const x = 42 + i * 86;
      const y = 155 - (horasMes[i] / maximo) * 110;

      this.puntos.push({ x: x, y: y });
      this.puntosGrafico += x + ',' + y + ' ';
    }
  }
}
