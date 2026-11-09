import { ChangeDetectorRef, Component, inject} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {ClienteServicio} from '../../servicios/cliente.servicio';

@Component({
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    RouterLink,
    RouterLinkActive,
  ],
  selector: 'app-barra-lateral',
  styleUrl: './barra-lateral.css',
  templateUrl: './barra-lateral.html',
})
export class BarraLateral {
  private usuarioServicio: ClienteServicio = inject(ClienteServicio);
  private detector = inject(ChangeDetectorRef);
  nombre: string = '';
  error: string = '';
  constructor() {}

  ngOnInit() {
    this.obtenernombre();
  }

  obtenernombre() {
    const correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));

    this.usuarioServicio.obtenerUsuario(correo, idRol).subscribe({
      next: (data) => {
        this.nombre = data.nombre;
        this.detector.markForCheck();
      },
    });
  }
}
