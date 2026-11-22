import {Component, DestroyRef, inject, signal, ViewChild} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatDialog} from '@angular/material/dialog';
import {A27IncidenciaEnviadoDialogo} from './a27-incidencia-enviado-dialogo/a27-incidencia-enviado-dialogo';
import {MatIcon} from '@angular/material/icon';
import {BannerIncidenciasModelo, IncidenciaModelo} from '../../modelos/incidencia-modelo';
import {IncidenciaServicio} from '../../servicios/incidencia-servicio';
import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subscription} from 'rxjs';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatButton,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatDatepicker,
    MatSuffix,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderCellDef,
    DatePipe,
    FormsModule,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatSort,
    MatSortHeader,
    MatPaginator,
  ],
  providers: [provideNativeDateAdapter()],
  selector: 'app-a26-listado-incidencias-administrador-componente',
  styleUrl: './a26-listado-incidencias-administrador-componente.css',
  templateUrl: './a26-listado-incidencias-administrador-componente.html',
})
export class A26ListadoIncidenciasAdministradorComponente {
  readonly bannerIncidencia = signal<BannerIncidenciasModelo | null>(null);
  hoy = new Date();
  anio = this.hoy.getFullYear();
  mes = this.hoy.getMonth() + 1;
  readonly nombreMes = new Intl.DateTimeFormat('es-PE', {
    month: 'long',
  }).format(this.hoy);
  filtroTipo = '';
  filtroEstado = '';
  filtroFecha: Date | null = null;
  private readonly destroyRef = inject(DestroyRef);
  private consultaIncidencias?: Subscription;

  readonly displayedColumns = [
    'idIncidencia',
    'idUsuario',
    'tipo',
    'asunto',
    'fCreacion',
    'estado',
  ];
  readonly dataSource = new MatTableDataSource<IncidenciaModelo>();
  private readonly incidenciaServicio = inject(IncidenciaServicio);
  @ViewChild(MatPaginator) private paginator!: MatPaginator;
  @ViewChild(MatSort) private sort!: MatSort;


  cargarBanner(): void {
    this.incidenciaServicio.obtenerBanner(this.anio, this.mes).subscribe({
      next: (banner) => this.bannerIncidencia.set(banner),
      error: (error) => console.error('Error al cargar el banner de incidencias', error),
    });
  }


  ngOnInit() {
    this.cargarBanner();
    this.cargarIncidencias();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  readonly incidenciaSeleccionada = signal<IncidenciaModelo | null>(null);
  readonly idIncidenciaSeleccionada = signal<number | null>(null);
  readonly cargandoDetalle = signal(false);
  readonly errorDetalle = signal('');
  respuestaAdmin = '';
  private consultaDetalle?: Subscription;

  private readonly dialog = inject(MatDialog);
  readonly enviandoRespuesta = signal(false);
  readonly errorRespuesta = signal('');

  seleccionarIncidencia(id: number): void {
    if (this.enviandoRespuesta()) return;

    this.errorRespuesta.set('');
    this.consultaDetalle?.unsubscribe();
    this.idIncidenciaSeleccionada.set(id);
    this.incidenciaSeleccionada.set(null);
    this.errorDetalle.set('');
    this.cargandoDetalle.set(true);
    this.respuestaAdmin = '';

    this.consultaDetalle = this.incidenciaServicio.buscarIncidenciaPorId(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (incidencia) => {
          this.respuestaAdmin = incidencia.respuestaAdmin ?? '';
          this.incidenciaSeleccionada.set(incidencia);
          this.cargandoDetalle.set(false);
        },
        error: () => {
          this.errorDetalle.set('No se pudo cargar la incidencia. Vuelve a seleccionarla para reintentar.');
          this.cargandoDetalle.set(false);
        },
      });
  }

  enviarRespuesta(): void {
    const incidencia = this.incidenciaSeleccionada();
    const respuesta = this.respuestaAdmin.trim();

    if (this.enviandoRespuesta() || incidencia?.estado !== 'Pendiente' || !respuesta || respuesta.length > 300) {
      return;
    }

    this.enviandoRespuesta.set(true);
    this.errorRespuesta.set('');

    this.incidenciaServicio.responderIncidencia(incidencia.idIncidencia, respuesta)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (actualizada) => {
          this.incidenciaSeleccionada.set(actualizada);
          this.respuestaAdmin = actualizada.respuestaAdmin ?? respuesta;
          this.enviandoRespuesta.set(false);
          this.cargarIncidencias();
          this.cargarBanner();
          this.dialog.open(A27IncidenciaEnviadoDialogo, {
            width: '420px',
            maxWidth: '95vw',
            ariaLabelledBy: 'titulo-confirmacion-respuesta',
          });
        },
        error: () => {
          this.enviandoRespuesta.set(false);
          this.errorRespuesta.set('No se pudo guardar la respuesta. Intenta nuevamente.');
        },
      });
  }

  cargarIncidencias(): void {
    const fecha = this.filtroFecha;
    const fechaApi = fecha
      ? [
          fecha.getFullYear(),
          String(fecha.getMonth() + 1).padStart(2, '0'),
          String(fecha.getDate()).padStart(2, '0'),
        ].join('-')
      : undefined;

    const consulta = this.filtroTipo || this.filtroEstado || fechaApi
      ? this.incidenciaServicio.filtrarIncidencias(this.filtroTipo, this.filtroEstado, fechaApi)
      : this.incidenciaServicio.listarIncidencias();

    this.consultaIncidencias?.unsubscribe();
    this.consultaIncidencias = consulta.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (incidencias) => {
        this.dataSource.data = incidencias;
        this.paginator?.firstPage();
      },
      error: (error) => console.error('No se pudo cargar el listado de incidencias.', error),
    });
  }

  limpiarFiltros(): void {
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.filtroFecha = null;
    this.cargarIncidencias();
  }

}
