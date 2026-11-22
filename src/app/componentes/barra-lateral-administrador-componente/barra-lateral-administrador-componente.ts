import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs';
import { AdministradorServicio } from '../../servicios/administrador-servicio';
import { ImagenServicio } from '../../servicios/imagen-servicio';

interface EnlaceBarra {
  ruta: string;
  texto: string;
  icono?: string;
}

@Component({
  selector: 'app-barra-lateral-administrador-componente',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './barra-lateral-administrador-componente.html',
  styleUrl: './barra-lateral-administrador-componente.css'
})
export class BarraLateralAdministradorComponente implements OnInit {
  private readonly router = inject(Router);
  private readonly adminServicio = inject(AdministradorServicio);
  private readonly imagenServicio = inject(ImagenServicio);

  menuReportesAbierto = signal<boolean>(false);
  enRutaReportes = signal<boolean>(false);
  imgAdmin = signal<string | null>(null);

  constructor() {
    effect(() => {
      const nuevaFoto = this.imagenServicio.fotoPerfilActualizada();
      if (nuevaFoto) {
        this.imgAdmin.set(nuevaFoto);
      }
    });
  }

  readonly enlacesPrincipales: EnlaceBarra[] = [
    { ruta: '/perfil-administrador', texto: 'Perfil', icono: 'person_outline' },
    { ruta: '/solicitudes', texto: 'Solicitudes', icono: 'home' },
    { ruta: '/clientes', texto: 'Clientes', icono: 'people_outline' },
    { ruta: '/reservas', texto: 'Reservas', icono: 'layers' },
    { ruta: '/espacios', texto: 'Espacios', icono: 'sports_soccer' }
  ];

  readonly enlacesReportes: EnlaceBarra[] = [
    { ruta: '/reporte-deporte-sede', texto: 'Reservas por deporte y Sede' },
    { ruta: '/reporte-cancelacion', texto: 'Reservas Canceladas' },
    { ruta: '/reporte-financiero', texto: 'Financiero por periodo' },
    { ruta: '/reporte-cantidad-reservas', texto: 'Cantidad de Reservas' },
    { ruta: '/reporte-incidencias', texto: 'Incidencias enviadas y atendidas' }
  ];

  ngOnInit(): void {
    this.verificarRutaActiva(this.router.url);
    this.cargarFotoAdmin();

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.verificarRutaActiva(event.urlAfterRedirects || event.url);
    });
  }

  private cargarFotoAdmin(): void {
    const correo =
      localStorage.getItem('correo') ||
      localStorage.getItem('correoAdministrador') ||
      this.obtenerCorreoDesdeToken();
    if (!correo) return;

    this.adminServicio.obtenerAdministradorCorreo(correo, 2).subscribe({
      next: (admin) => {
        if (admin?.imgUsuario) {
          this.imgAdmin.set(admin.imgUsuario);
        }
      }
    });
  }

  private obtenerCorreoDesdeToken(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.sub || '';
    } catch {
      return '';
    }
  }

  private verificarRutaActiva(url: string): void {
    const esReporte = url.includes('/reporte');
    this.enRutaReportes.set(esReporte);
    if (esReporte) {
      this.menuReportesAbierto.set(true);
    }
  }

  toggleMenuReportes(): void {
    this.menuReportesAbierto.update(abierto => !abierto);
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/administrador']);
  }
}
