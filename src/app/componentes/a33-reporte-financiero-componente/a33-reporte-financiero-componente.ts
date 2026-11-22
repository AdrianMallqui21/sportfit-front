import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import {
  IngresoDiarioModelo,
  DistribucionPagoModelo,
  BannerPagoReporteModelo
} from '../../modelos/reporte-financiero-modelo';
import { ReporteFinancieroServicio } from '../../servicios/reporte-financiero-servicio';
import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';
import { CredencialesDTOModelo } from '../../modelos/credenciales-dto-modelo';

interface PuntoGrafico {
  x: number;
  y: number;
  etiqueta: string;
  valor: number;
}

interface SegmentoCircular {
  nombre: string;
  monto: number;
  porcentaje: number;
  color: string;
  strokeDashoffset: number;
  strokeDasharray: string;
}

@Component({
  selector: 'app-a33-reporte-financiero-componente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './a33-reporte-financiero-componente.html',
  styleUrl: './a33-reporte-financiero-componente.css'
})
export class A33ReporteFinancieroComponente implements OnInit {
  private readonly reporteServicio = inject(ReporteFinancieroServicio);
  private readonly authServicio = inject(AutorizacionServicio);
  private readonly router = inject(Router);

  // Filtros (Escenarios 1 y 4)
  aniosDisponibles: number[] = [2026, 2025, 2024];
  mesesDisponibles = [
    { valor: 0, nombre: 'Todos' },
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Setiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];

  filtroAnio: number = 2026;
  filtroMes: number = 0; // 0 = Todo el año
  tipoGrafica: 'lineal' | 'barras' = 'lineal';

  // Datos del backend
  ingresos = signal<IngresoDiarioModelo[]>([]);
  distribucionMetodos = signal<DistribucionPagoModelo[]>([]);
  banner = signal<BannerPagoReporteModelo>({
    recaudacionTotal: 0,
    promedioDiario: 0,
    diaPico: 0,
    pagosRealizados: 0
  });

  // Fecha del día pico
  fechaDiaPico = signal<string>('—');

  // Estado de carga y Vista a34 (Sin datos / alerta)
  cargando = signal<boolean>(false);
  sinDatosModal = signal<boolean>(false);
  alertaAutenticacion = signal<boolean>(false);
  iniciandoSesionRapida = signal<boolean>(false);

  // Paleta de colores para gráfico circular
  private readonly coloresMetodos: Record<string, string> = {
    plin: '#8b5cf6', // morado
    yape: '#06b6d4', // cyan / turquesa
    transferencia: '#f87171', // coral / salmon
    tarjeta: '#3b82f6', // azul
    efectivo: '#10b981' // verde esmeralda
  };

  ngOnInit(): void {
    // Si no hay sesión activa de administrador, indicarlo de inmediato
    if (!localStorage.getItem('token')) {
      this.alertaAutenticacion.set(true);
    }
    this.cargarReporte();
  }

  cargarReporte(): void {
    this.cargando.set(true);
    this.sinDatosModal.set(false);

    const mesParam = this.filtroMes > 0 ? this.filtroMes : null;

    // 1. ED41: Obtener Ingresos
    this.reporteServicio.obtenerIngresosPorPeriodo(this.filtroAnio, mesParam).subscribe({
      next: (data) => {
        const lista = data || [];
        this.ingresos.set(lista);
        this.alertaAutenticacion.set(false);

        if (lista.length === 0) {
          this.activarEstadoSinDatos();
        } else {
          // Calcular fecha del día pico
          let maxIngreso = 0;
          let fechaPico = '—';
          lista.forEach(item => {
            if (Number(item.ingresos) > maxIngreso) {
              maxIngreso = Number(item.ingresos);
              fechaPico = item.fecha;
            }
          });
          this.fechaDiaPico.set(fechaPico);
        }
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          // Falta autenticación en el navegador
          this.alertaAutenticacion.set(true);
          this.sinDatosModal.set(false);
        } else {
          // Escenario 4 y 5: Manejo de excepción o período sin datos (Vista a34)
          this.ingresos.set([]);
          this.activarEstadoSinDatos();
        }
      }
    });

    // 2. ED42: Obtener Distribución por Método de Pago
    this.reporteServicio.obtenerDistribucionPorMetodoPago(this.filtroAnio, mesParam).subscribe({
      next: (data) => {
        this.distribucionMetodos.set(data || []);
      },
      error: () => {
        this.distribucionMetodos.set([]);
      }
    });

    // 3. ED62: Cargar Banners / Tarjetas
    this.reporteServicio.cargarBannerPago(this.filtroAnio, mesParam).subscribe({
      next: (data) => {
        if (data) {
          this.banner.set(data);
        }
      },
      error: () => {
        this.banner.set({
          recaudacionTotal: 0,
          promedioDiario: 0,
          diaPico: 0,
          pagosRealizados: 0
        });
      }
    });
  }

  // Inicio de sesión rápido como administrador para facilitar pruebas
  iniciarSesionAdminPrueba(): void {
    this.iniciandoSesionRapida.set(true);
    const cred = new CredencialesDTOModelo();
    cred.correo = 'admin@sportfit.com';
    cred.password = 'admin123';
    this.authServicio.accederCliente(cred).subscribe({
      next: () => {
        localStorage.setItem('rol', 'ROLE_ADMINISTRADOR');
        this.iniciandoSesionRapida.set(false);
        this.alertaAutenticacion.set(false);
        this.cargarReporte();
      },
      error: () => {
        this.iniciandoSesionRapida.set(false);
      }
    });
  }

  activarEstadoSinDatos(): void {
    this.sinDatosModal.set(true);
    this.banner.set({
      recaudacionTotal: 0,
      promedioDiario: 0,
      diaPico: 0,
      pagosRealizados: 0
    });
    this.fechaDiaPico.set('—');
  }

  cerrarModalSinDatos(): void {
    this.sinDatosModal.set(false);
  }

  // --- CÁLCULOS PARA GRÁFICO LINEAL / BARRAS SVG ---
  puntosGrafico = computed<PuntoGrafico[]>(() => {
    const data = this.ingresos();
    if (data.length === 0) return [];

    const width = 640;
    const height = 220;
    const paddingLeft = 45;
    const paddingRight = 35;
    const paddingTop = 25;
    const paddingBottom = 40;

    const maxValor = Math.max(...data.map(d => Number(d.ingresos)), 2000);
    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;

    const step = data.length > 1 ? usableWidth / (data.length - 1) : usableWidth / 2;

    return data.map((d, index) => {
      const x = paddingLeft + index * step;
      const valor = Number(d.ingresos);
      const y = height - paddingBottom - (valor / maxValor) * usableHeight;
      const etiqueta = d.fecha ? d.fecha.slice(5) : `P${index + 1}`;
      return { x, y, etiqueta, valor };
    });
  });

  polylinePoints = computed<string>(() => {
    return this.puntosGrafico().map(p => `${p.x},${p.y}`).join(' ');
  });

  polygonAreaPoints = computed<string>(() => {
    const puntos = this.puntosGrafico();
    if (puntos.length === 0) return '';
    const first = puntos[0];
    const last = puntos[puntos.length - 1];
    const baselineY = 180;
    return `${first.x},${baselineY} ${this.polylinePoints()} ${last.x},${baselineY}`;
  });

  // --- CÁLCULOS PARA GRÁFICO CIRCULAR / DONA SVG ---
  segmentosCirculares = computed<SegmentoCircular[]>(() => {
    const metodos = this.distribucionMetodos();
    if (metodos.length === 0) return [];

    const total = metodos.reduce((sum, m) => sum + Number(m.totalRecaudado), 0);
    if (total === 0) return [];

    let acumulado = 0;
    const circunferencia = 2 * Math.PI * 45;

    return metodos.map(m => {
      const monto = Number(m.totalRecaudado);
      const porcentaje = (monto / total) * 100;
      const strokeLength = (porcentaje / 100) * circunferencia;
      const strokeDashoffset = -acumulado;
      acumulado += strokeLength;

      const clave = (m.metodoPago || '').toLowerCase().trim();
      const color = this.coloresMetodos[clave] || '#64748b';

      return {
        nombre: m.metodoPago,
        monto,
        porcentaje,
        color,
        strokeDashoffset,
        strokeDasharray: `${strokeLength} ${circunferencia - strokeLength}`
      };
    });
  });

  // Exportar reporte a archivo CSV
  exportarReporte(): void {
    const data = this.ingresos();
    if (data.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,Fecha,Ingresos (S/),Cantidad de Pagos\n';
    data.forEach(d => {
      csvContent += `${d.fecha},${d.ingresos},${d.cantidadPagos}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_financiero_${this.filtroAnio}_${this.filtroMes || 'todos'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
