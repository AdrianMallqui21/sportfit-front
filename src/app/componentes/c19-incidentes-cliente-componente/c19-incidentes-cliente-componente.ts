import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BarraLateral } from '../barra-lateral-cliente/barra-lateral';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import { IncidenciaServicio } from '../../servicios/incidencia-servicio';
import { IncidenciaModelo, IncidenciaRegistroModelo } from '../../modelos/incidencia-modelo';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { C20IncidenciaEnviadaDialogo} from './c20-incidencia-enviada-dialogo/c20-incidencia-enviada-dialogo';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';



@Component({
  selector: 'app-c19-incidentes-cliente-componente',
  imports: [
    BarraLateral,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    C20IncidenciaEnviadaDialogo,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatNativeDateModule,
  ],
  templateUrl: './c19-incidentes-cliente-componente.html',
  styleUrl: './c19-incidentes-cliente-componente.css',
})
export class C19IncidentesClienteComponente implements OnInit {
  incidenciaForm: FormGroup;
  fb: FormBuilder = inject(FormBuilder);
  clienteServicio: ClienteServicio = inject(ClienteServicio);
  incidenciaServicio: IncidenciaServicio = inject(IncidenciaServicio);
  detector = inject(ChangeDetectorRef);
  idUsuario: number = 0;

  incidencias: IncidenciaModelo[] = [];
  cargando: boolean = true;
  enviando: boolean = false;
  error: string = '';

  filtroForm: FormGroup;
  incidenciasFiltradas: IncidenciaModelo[] = [];
  mostrarConfirmacion: boolean = false;

  constructor() {
    this.incidenciaForm = this.fb.group({
      tipo: ['', Validators.required],
      asunto: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(300)]],
    });
    this.filtroForm = this.fb.group({ tipo: [''], fecha: [null] });
  }

  ngOnInit() {
    this.obtenerUsuario();
  }

  // Obtenemos el usuario que inició sesión
  obtenerUsuario() {
    const correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));

    this.clienteServicio.obtenerUsuario(correo, idRol).subscribe({
      next: (data) => {
        this.idUsuario = data.idUsuario;

        this.cargando = false;

        // Cargamos el historial del cliente
        this.listarIncidencias();

        this.detector.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener usuario:', error);
        this.error = 'No se pudieron cargar los datos del usuario';
        this.cargando = false;
        this.detector.markForCheck();
      },
    });
  }

  // ED27 - Listar incidencias del cliente
  listarIncidencias() {
    this.incidenciaServicio.listarPorUsuario(this.idUsuario).subscribe({
      next: (data) => {
        this.incidencias = data;
        this.incidenciasFiltradas = data;
        this.detector.markForCheck();
      },
      error: (error) => {
        console.error('Error al listar incidencias:', error);
      },
    });
  }

  // ED34 - Registrar incidencia
  protected onSubmit() {
    if (this.incidenciaForm.valid && this.idUsuario > 0 && !this.enviando) {
      let incidencia = new IncidenciaRegistroModelo();

      incidencia.tipo = this.incidenciaForm.value.tipo;
      incidencia.asunto = this.incidenciaForm.value.asunto;
      incidencia.descripcion = this.incidenciaForm.value.descripcion;
      incidencia.idUsuario = this.idUsuario;

      console.log('Datos de la incidencia:', incidencia);

      this.enviando = true;

      this.incidenciaServicio.registrarIncidencia(incidencia).subscribe({
        next: (data) => {
          console.log('Incidencia registrada:', data);

          this.mostrarConfirmacion = true;

          this.incidenciaForm.reset({
            tipo: '',
            asunto: '',
            descripcion: '',
          });

          this.enviando = false;

          // Actualizamos el historial
          this.listarIncidencias();

          this.detector.markForCheck();
        },
        error: (error) => {
          console.error('Error al registrar incidencia:', error);

          alert('No se pudo registrar la incidencia');

          this.enviando = false;

          this.detector.markForCheck();
        },
      });
    } else {
      this.incidenciaForm.markAllAsTouched();

      console.log('Formulario no válido');
    }
  }

  // Buscar incidencias por tipo y fecha
  buscarIncidencias() {
    const tipo = this.filtroForm.value.tipo;
    const fecha = this.filtroForm.value.fecha;

    const fechaSeleccionada = fecha ? formatDate(fecha, 'yyyy-MM-dd', 'en-US') : '';

    this.incidenciasFiltradas = this.incidencias.filter((incidencia) => {
      const coincideTipo = !tipo || incidencia.tipo === tipo;

      const fechaIncidencia = incidencia.fCreacion
        ? formatDate(incidencia.fCreacion, 'yyyy-MM-dd', 'en-US')
        : '';

      const coincideFecha = !fechaSeleccionada || fechaIncidencia === fechaSeleccionada;

      return coincideTipo && coincideFecha;
    });

    this.detector.markForCheck();
  }

  // Limpiar los filtros
  limpiarFiltros() {
    this.filtroForm.reset({
      tipo: '',
      fecha: null,
    });

    this.incidenciasFiltradas = this.incidencias;

    this.detector.markForCheck();
  }
}
