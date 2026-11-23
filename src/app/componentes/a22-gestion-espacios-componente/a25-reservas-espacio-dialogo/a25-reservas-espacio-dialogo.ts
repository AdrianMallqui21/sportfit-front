import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { SedeCanchaModelo } from '../../../modelos/espacio-deportivo-modelo';
import { ReservaModelo } from '../../../modelos/solicitud-reserva-modelo';
import { EspacioDeportivoServicio } from '../../../servicios/espacio-deportivo-servicio';

@Component({
  selector: 'app-a25-reservas-espacio-dialogo',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './a25-reservas-espacio-dialogo.html',
  styleUrl: './a25-reservas-espacio-dialogo.css'
})
export class A25ReservasEspacioDialogo implements OnInit {
  private readonly espacioServicio = inject(EspacioDeportivoServicio);

  reservas = signal<ReservaModelo[]>([]);
  cargando = signal<boolean>(true);
  columnas = ['fecha', 'horario', 'cliente', 'estado'];

  constructor(@Inject(MAT_DIALOG_DATA) public cancha: SedeCanchaModelo) {}

  ngOnInit(): void {
    this.espacioServicio.listarReservasPorCancha(this.cancha.idSedeCancha).subscribe({
      next: (lista) => {
        this.reservas.set(lista || []);
        this.cargando.set(false);
      },
      error: () => {
        this.reservas.set([]);
        this.cargando.set(false);
      }
    });
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '—';
    const soloFecha = fechaStr.split('T')[0];
    const partes = soloFecha.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : soloFecha;
  }

  obtenerNombreCliente(r: ReservaModelo): string {
    if (r.usuario?.nombre) {
      return `${r.usuario.nombre} ${r.usuario.apellido || ''}`.trim();
    }
    return 'Cliente';
  }
}
