import { ChangeDetectorRef, Component, effect, inject} from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ClienteServicio } from '../../servicios/cliente.servicio';
import { ImagenServicio } from '../../servicios/imagen-servicio';

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
  private imagenServicio: ImagenServicio = inject(ImagenServicio);
  private detector = inject(ChangeDetectorRef);
  nombre: string = '';
  error: string = '';
  imgUsuario: string | null = null;
  constructor() {
    effect(() => {
      const nuevaFoto = this.imagenServicio.fotoPerfilActualizada();
      if (nuevaFoto) {
        this.imgUsuario = nuevaFoto;
        this.detector.markForCheck();
      }
    });
  }

  ngOnInit() {
    this.obtenernombre();
  }

  obtenernombre() {
    const correo = localStorage.getItem('correo') || '';
    const idRol = Number(localStorage.getItem('idRol'));

    this.usuarioServicio.obtenerUsuario(correo, idRol).subscribe({
      next: (data) => {
        this.nombre = data.nombre;
        this.imgUsuario = data.imgUsuario;
        this.detector.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener usuario:', error);
      },
    });
  }

  router = inject(Router);
  //Quitamos las credencialess
  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('correo');
    localStorage.removeItem('rol');
    localStorage.removeItem('idRol');

    this.router.navigate(['/login']);
  }
}
