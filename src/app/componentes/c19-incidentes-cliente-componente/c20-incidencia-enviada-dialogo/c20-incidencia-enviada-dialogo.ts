import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-c20-incidencia-enviada-dialogo',
  imports: [MatButtonModule],
  templateUrl: './c20-incidencia-enviada-dialogo.html',
  styleUrl: './c20-incidencia-enviada-dialogo.css',
})
export class C20IncidenciaEnviadaDialogo {
  @Output() cerrado = new EventEmitter<void>();

  cerrar() {
    this.cerrado.emit();
  }
}
