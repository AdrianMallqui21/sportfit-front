import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs';

@Component({
  selector: 'app-barra-lateral-administrador-componente',
  standalone: true,
  imports: [
    CommonModule,
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

  menuReportesAbierto = signal<boolean>(false);
  enRutaReportes = signal<boolean>(false);

  ngOnInit(): void {
    this.verificarRutaActiva(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.verificarRutaActiva(event.urlAfterRedirects || event.url);
    });
  }

  verificarRutaActiva(url: string): void {
    const esReporte = url.includes('/reporte-') || url.includes('/reporte');
    this.enRutaReportes.set(esReporte);
    if (esReporte) {
      this.menuReportesAbierto.set(true);
    }
  }

  toggleMenuReportes(): void {
    this.menuReportesAbierto.update(v => !v);
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.clear();
    this.router.navigate(['/administrador']);
  }
}
