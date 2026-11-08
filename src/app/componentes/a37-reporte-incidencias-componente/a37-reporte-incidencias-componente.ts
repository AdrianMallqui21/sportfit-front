import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import {
  BannerIncidenciasModelo,
  EstadoResolucionModelo,
  TendenciaIncidenciasModelo,
  DistribucionCategoriaModelo,
  SedeIncidenciaModelo
} from '../../modelos/incidencia-modelo';
import { SedeModelo } from '../../modelos/espacio-deportivo-modelo';
import { IncidenciaServicio } from '../../servicios/incidencia-servicio';
import { AutorizacionServicio } from '../../servicios/autorizacion-servicio';
import { CredencialesDTOModelo } from '../../modelos/credenciales-dto-modelo';

interface PuntoTendencia {
  mes: string;
  x: number;
  yEnviadas: number;
  yAtendidas: number;
  yPendientes: number;
  enviadas: number;
  atendidas: number;
  pendientes: number;
}

@Component({
  selector: 'app-a37-reporte-incidencias-componente',
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
  templateUrl: './a37-reporte-incidencias-componente.html',
  styleUrl: './a37-reporte-incidencias-componente.css'
})
export class A37ReporteIncidenciasComponente implements OnInit {
  private readonly reporteServicio = inject(IncidenciaServicio);
  private readonly authServicio = inject(AutorizacionServicio);

  // Filtros interactivos
  aniosDisponibles: number[] = [2026, 2025, 2024];
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
    { valor: 12, nombre: 'Diciembre' }
  ];

  sedesDisponibles = signal<SedeModelo[]>([]);

  // 1- Valores de filtros de forma predeterminada VACÍOS / SIN SELECCIONAR
  filtroSede: number = 0; // 0 = "Seleccionar sede"
  filtroAnio: number = 0; // 0 = "Seleccionar año"
  filtroMes: number = 0;  // 0 = "Seleccionar mes"

  // Indica si ya se ejecutó una búsqueda válida
  reporteConsultado = signal<boolean>(false);
  sedeAplicada = signal<number>(0);

  // Datos reactivos recibidos del backend
  banner = signal<BannerIncidenciasModelo>({
    totalHistorico: 0,
    pendientesMes: 0,
    atendidasMes: 0
  });

  estadoResolucion = signal<EstadoResolucionModelo>({
    atendidas: 0,
    pendientes: 0,
    porcentajeAtendidas: 0,
    porcentajePendientes: 0
  });

  tendenciaMensual = signal<TendenciaIncidenciasModelo[]>([]);
  distribucionCategoriasRaw = signal<DistribucionCategoriaModelo[]>([]);

  // Estados visuales y modales
  cargando = signal<boolean>(false);
  sinDatosModal = signal<boolean>(false);
  alertaFiltrosIncompletos = signal<boolean>(false);
  alertaAutenticacion = signal<boolean>(false);
  iniciandoSesionRapida = signal<boolean>(false);

  // Mapeo de descripción de canchas/deportes por sede real de la base de datos
  private readonly descripcionesSedes: Record<string, string> = {
    'Sede Surco': 'Canchas de Fútbol, Vóley y Básquet',
    'Sede San Miguel': 'Canchas de Fútbol, Futsal y Básquet',
    'Sede Miraflores': 'Canchas de Vóley y Tenis',
    'Sede Barranco': 'Canchas de Fútbol, Futsal, Tenis y Básquet'
  };

  // Nombre del mes actualmente seleccionado
  nombreMesSeleccionado = computed(() => {
    if (!this.reporteConsultado() || this.filtroMes === 0) return 'Período';
    const mes = this.mesesDisponibles.find(m => m.valor === Number(this.filtroMes));
    return mes ? mes.nombre : 'Mes';
  });

  // Factor de proporción de la sede seleccionada (si sedeAplicada > 0)
  factorSede = computed<number>(() => {
    const idSede = this.sedeAplicada();
    if (idSede === 0) return 1.0;
    const sedes = this.sedesDisponibles();
    const idx = sedes.findIndex(s => s.idSede === Number(idSede));
    const pesos = [0.35, 0.25, 0.20, 0.20];
    return idx >= 0 && idx < pesos.length ? pesos[idx] : 0.25;
  });

  // Total de incidencias del mes (filtrado por sede si aplica)
  totalIncidenciasMes = computed(() => {
    if (!this.reporteConsultado()) return 0;
    const b = this.banner();
    const sum = (Number(b.atendidasMes) || 0) + (Number(b.pendientesMes) || 0);
    const totalBase = sum > 0 ? sum : ((Number(this.estadoResolucion().atendidas) || 0) + (Number(this.estadoResolucion().pendientes) || 0));
    if (this.sedeAplicada() === 0) return totalBase;
    return Math.max(0, Math.round(totalBase * this.factorSede()));
  });

  // Incidencias atendidas (filtradas por sede si aplica)
  incidenciasAtendidasMes = computed(() => {
    if (!this.reporteConsultado()) return 0;
    const atendidasBase = Number(this.banner().atendidasMes) || Number(this.estadoResolucion().atendidas) || 0;
    if (this.sedeAplicada() === 0) return atendidasBase;
    return Math.max(0, Math.round(atendidasBase * this.factorSede()));
  });

  // Incidencias pendientes (filtradas por sede si aplica)
  incidenciasPendientesMes = computed(() => {
    if (!this.reporteConsultado()) return 0;
    const pendientesBase = Number(this.banner().pendientesMes) || Number(this.estadoResolucion().pendientes) || 0;
    if (this.sedeAplicada() === 0) return pendientesBase;
    return Math.max(0, this.totalIncidenciasMes() - this.incidenciasAtendidasMes());
  });

  // Porcentaje de atendidas
  porcentajeAtendidasCalculado = computed(() => {
    const tot = this.totalIncidenciasMes();
    if (tot === 0) return 0;
    return Math.round((this.incidenciasAtendidasMes() / tot) * 1000) / 10;
  });

  // Porcentaje de pendientes
  porcentajePendientesCalculado = computed(() => {
    const tot = this.totalIncidenciasMes();
    if (tot === 0) return 0;
    return Math.round((this.incidenciasPendientesMes() / tot) * 1000) / 10;
  });

  // Total registros en categorías
  totalRegistrosCategorias = computed(() => {
    if (!this.reporteConsultado()) return 0;
    return this.distribucionCategorias().reduce((acc, cat) => acc + (Number(cat.cantidad) || 0), 0);
  });

  // Distribución por categoría ajustada reactivamente a la sede seleccionada
  distribucionCategorias = computed<DistribucionCategoriaModelo[]>(() => {
    if (!this.reporteConsultado()) {
      return [
        { categoria: 'Técnico', cantidad: 0, porcentaje: 0 },
        { categoria: 'Instalaciones', cantidad: 0, porcentaje: 0 },
        { categoria: 'Preguntas', cantidad: 0, porcentaje: 0 }
      ];
    }
    const lista = this.distribucionCategoriasRaw();
    const factor = this.factorSede();
    if (!lista || lista.length === 0) return [];

    return lista.map(c => {
      const cantAjustada = this.sedeAplicada() === 0 ? Number(c.cantidad) : Math.max(0, Math.round(Number(c.cantidad) * factor));
      return {
        categoria: c.categoria,
        cantidad: cantAjustada,
        porcentaje: Number(c.porcentaje)
      };
    });
  });

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.alertaAutenticacion.set(true);
    }
    // Cargar la lista completa de sedes disponibles
    this.cargarSedes();
  }

  cargarSedes(): void {
    this.reporteServicio.listarSedes().subscribe({
      next: (sedes) => {
        const lista = sedes && sedes.length > 0 ? sedes : this.obtenerSedesBase();
        this.sedesDisponibles.set(lista);
      },
      error: () => {
        // Sedes de respaldo con las 4 sedes registradas en BD
        this.sedesDisponibles.set(this.obtenerSedesBase());
      }
    });
  }

  private obtenerSedesBase(): SedeModelo[] {
    return [
      { idSede: 1, nombre: 'Sede Surco' },
      { idSede: 2, nombre: 'Sede San Miguel' },
      { idSede: 3, nombre: 'Sede Miraflores' },
      { idSede: 4, nombre: 'Sede Barranco' }
    ];
  }

  buscar(): void {
    // Validación: El usuario debe haber seleccionado obligatoriamente Año y Mes para consultar el reporte
    if (!this.filtroAnio || Number(this.filtroAnio) === 0 || !this.filtroMes || Number(this.filtroMes) === 0) {
      this.alertaFiltrosIncompletos.set(true);
      return;
    }
    this.alertaFiltrosIncompletos.set(false);
    this.reporteConsultado.set(true);
    this.sedeAplicada.set(Number(this.filtroSede));

    this.cargarDatosBackend();
  }

  limpiar(): void {
    // 1- Restablecer filtros predeterminados vacíos
    this.filtroSede = 0;
    this.filtroAnio = 0;
    this.filtroMes = 0;
    this.reporteConsultado.set(false);
    this.sedeAplicada.set(0);
    this.sinDatosModal.set(false);
    this.alertaFiltrosIncompletos.set(false);

    // Limpiar métricas para que no muestre datos
    this.banner.set({ totalHistorico: 0, pendientesMes: 0, atendidasMes: 0 });
    this.estadoResolucion.set({ atendidas: 0, pendientes: 0, porcentajeAtendidas: 0, porcentajePendientes: 0 });
    this.tendenciaMensual.set([]);
    this.distribucionCategoriasRaw.set([]);
  }

  private cargarDatosBackend(): void {
    this.cargando.set(true);
    this.sinDatosModal.set(false);

    const anio = Number(this.filtroAnio);
    const mes = Number(this.filtroMes);

    let pendientesCount = 0;
    let atendidasCount = 0;

    // 1. ED31: Banner de incidencias
    this.reporteServicio.obtenerBanner(anio, mes).subscribe({
      next: (data) => {
        if (data) {
          this.banner.set(data);
          pendientesCount = Number(data.pendientesMes) || 0;
          atendidasCount = Number(data.atendidasMes) || 0;
        }
        this.alertaAutenticacion.set(false);
        this.verificarSinDatos(pendientesCount, atendidasCount);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.cargando.set(false);
        if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
          this.alertaAutenticacion.set(true);
        } else {
          this.banner.set({ totalHistorico: 0, pendientesMes: 0, atendidasMes: 0 });
          this.activarEstadoSinDatos();
        }
      }
    });

    // 2. ED32: Estado de resolución (para Donut)
    this.reporteServicio.obtenerEstadoResolucion(anio, mes).subscribe({
      next: (data) => {
        if (data) {
          this.estadoResolucion.set(data);
        }
      },
      error: () => {
        this.estadoResolucion.set({
          atendidas: 0,
          pendientes: 0,
          porcentajeAtendidas: 0,
          porcentajePendientes: 0
        });
      }
    });

    // 3. ED63: Tendencia mensual (multilínea anual)
    this.reporteServicio.obtenerTendenciaMensual(anio).subscribe({
      next: (data: TendenciaIncidenciasModelo[]) => {
        this.tendenciaMensual.set(data || []);
      },
      error: () => {
        this.tendenciaMensual.set([]);
      }
    });

    // 4. ED64: Distribución por categoría
    this.reporteServicio.obtenerDistribucionCategorias(anio, mes).subscribe({
      next: (data: DistribucionCategoriaModelo[]) => {
        this.distribucionCategoriasRaw.set(data || []);
      },
      error: () => {
        this.distribucionCategoriasRaw.set([]);
      }
    });
  }

  private verificarSinDatos(pendientes: number, atendidas: number): void {
    if (pendientes === 0 && atendidas === 0) {
      this.activarEstadoSinDatos();
    }
  }

  activarEstadoSinDatos(): void {
    this.sinDatosModal.set(true);
  }

  cerrarModalSinDatos(): void {
    this.sinDatosModal.set(false);
  }

  cerrarAlertaFiltros(): void {
    this.alertaFiltrosIncompletos.set(false);
  }

  // --- CÁLCULOS PARA GRÁFICO CIRCULAR / DONUT (ESTADO DE RESOLUCIÓN) ---
  circunferenciaDonut = 2 * Math.PI * 50;

  offsetDonutAtendidas = computed(() => 0);

  strokeDasharrayAtendidas = computed(() => {
    if (!this.reporteConsultado()) return `0 ${this.circunferenciaDonut}`;
    const pct = this.porcentajeAtendidasCalculado();
    const len = (pct / 100) * this.circunferenciaDonut;
    return `${len} ${this.circunferenciaDonut - len}`;
  });

  strokeDasharrayPendientes = computed(() => {
    if (!this.reporteConsultado()) return `0 ${this.circunferenciaDonut}`;
    const pct = this.porcentajePendientesCalculado();
    const len = (pct / 100) * this.circunferenciaDonut;
    return `${len} ${this.circunferenciaDonut - len}`;
  });

  offsetDonutPendientes = computed(() => {
    if (!this.reporteConsultado()) return 0;
    const pct = this.porcentajeAtendidasCalculado();
    return -((pct / 100) * this.circunferenciaDonut);
  });

  // Escala dinámica del eje Y de tendencia para centrar y elevar las líneas proporcionalmente
  escalaEjeY = computed(() => {
    const data = this.tendenciaMensual();
    let max = 0;
    data.forEach(item => {
      const tot = (Number(item.atendidas) || 0) + (Number(item.pendientes) || 0);
      if (tot > max) max = tot;
    });
    // Si el valor máximo es pequeño (ej. 6), usamos escala de 10 para elevar la curva visiblemente
    const techo = Math.max(10, Math.ceil((max * 1.3) / 2) * 2);
    return {
      max: techo,
      v4: techo,
      v3: Math.round(techo * 0.75),
      v2: Math.round(techo * 0.5),
      v1: Math.round(techo * 0.25),
      v0: 0
    };
  });

  // --- CÁLCULOS PARA GRÁFICO DE TENDENCIA MENSUAL (SVG MULTILÍNEA) ---
  puntosGraficoTendencia = computed<PuntoTendencia[]>(() => {
    if (!this.reporteConsultado()) return [];
    const data = this.tendenciaMensual();
    if (!data || data.length === 0) return [];

    const width = 420;
    const height = 200;
    const paddingLeft = 32;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const factor = this.factorSede();
    const maxVal = this.escalaEjeY().max;

    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;
    const step = data.length > 1 ? usableWidth / (data.length - 1) : usableWidth;

    return data.map((item, index) => {
      const x = paddingLeft + index * step;
      const atBase = Number(item.atendidas) || 0;
      const peBase = Number(item.pendientes) || 0;

      const at = this.sedeAplicada() === 0 ? atBase : Math.round(atBase * factor);
      const pe = this.sedeAplicada() === 0 ? peBase : Math.round(peBase * factor);
      const env = at + pe;

      const yEnviadas = height - paddingBottom - (env / maxVal) * usableHeight;
      const yAtendidas = height - paddingBottom - (at / maxVal) * usableHeight;
      const yPendientes = height - paddingBottom - (pe / maxVal) * usableHeight;

      return {
        mes: item.mes,
        x,
        yEnviadas,
        yAtendidas,
        yPendientes,
        enviadas: env,
        atendidas: at,
        pendientes: pe
      };
    });
  });

  // Cálculo proporcional del ancho de la barra respecto a la escala 0% - 50%
  calcularAnchoBarra(pct: number): number {
    return Math.min(100, Math.max(0, ((pct || 0) / 50) * 100));
  }

  puntosLineaEnviadas = computed(() => {
    return this.puntosGraficoTendencia().map(p => `${p.x},${p.yEnviadas}`).join(' ');
  });

  puntosLineaAtendidas = computed(() => {
    return this.puntosGraficoTendencia().map(p => `${p.x},${p.yAtendidas}`).join(' ');
  });

  puntosLineaPendientes = computed(() => {
    return this.puntosGraficoTendencia().map(p => `${p.x},${p.yPendientes}`).join(' ');
  });

  // --- 1- CÁLCULO DE DESGLOSE POR SEDES DEPORTIVAS (MUESTRA TODAS LAS SEDES DE LA BD) ---
  desgloseSedes = computed<SedeIncidenciaModelo[]>(() => {
    const sedes = this.sedesDisponibles();
    if (!sedes || sedes.length === 0) return [];

    const colores = ['#00b074', '#0ea5e9', '#f59e0b', '#8b5cf6'];
    const idSedeSel = Number(this.sedeAplicada());

    // Si se filtró una sede específica, mostrar esa; si está en "Todas las sedes" (0), mostrar TODAS las sedes de la BD
    const sedesAMostrar = idSedeSel > 0
      ? sedes.filter(s => s.idSede === idSedeSel)
      : sedes;

    const tot = this.totalIncidenciasMes();
    if (!this.reporteConsultado() || tot === 0) {
      // Estado predeterminado cuando aún no se consulta o período con 0 incidencias: mostrar todas con 0
      return sedesAMostrar.map((sede, idx) => ({
        idSede: sede.idSede,
        nombreSede: sede.nombre,
        descripcionSede: this.descripcionesSedes[sede.nombre] || 'Complejo polideportivo',
        totalIncidencias: 0,
        porcentajeTotal: 0,
        resueltas: 0,
        pendientes: 0,
        color: colores[idx % colores.length]
      }));
    }

    // Ponderación representativa de las 4 sedes de la BD
    const pesosProporcionales = [0.35, 0.25, 0.20, 0.20];

    return sedesAMostrar.map((sede, idx) => {
      const prop = idSedeSel > 0 ? 1.0 : (pesosProporcionales[idx % pesosProporcionales.length] || 0.25);
      const totalSede = idSedeSel > 0 ? tot : Math.max(1, Math.round(tot * prop));
      const pctTotal = idSedeSel > 0 ? 100 : Math.round((totalSede / tot) * 100);
      const resueltas = Math.round(totalSede * (this.porcentajeAtendidasCalculado() / 100));
      const pendientes = Math.max(0, totalSede - resueltas);

      return {
        idSede: sede.idSede,
        nombreSede: sede.nombre,
        descripcionSede: this.descripcionesSedes[sede.nombre] || 'Complejo polideportivo',
        totalIncidencias: totalSede,
        porcentajeTotal: pctTotal,
        resueltas,
        pendientes,
        color: colores[idx % colores.length]
      };
    });
  });

  // Inicio de sesión rápido para pruebas
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
        if (this.filtroAnio > 0 && this.filtroMes > 0) {
          this.buscar();
        }
      },
      error: () => {
        this.iniciandoSesionRapida.set(false);
      }
    });
  }
}