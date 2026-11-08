import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { BarraLateralAdministradorComponente } from './componentes/barra-lateral-administrador-componente/barra-lateral-administrador-componente';

@Component({
  imports: [CommonModule, RouterOutlet, BarraLateralAdministradorComponente],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('sporfit');
  private readonly router = inject(Router);

  mostrarBarraAdmin = signal<boolean>(false);

  ngOnInit(): void {
    this.evaluarRuta(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.evaluarRuta(e.urlAfterRedirects || e.url);
    });
  }

  evaluarRuta(url: string): void {
    const cleanUrl = url.split('?')[0];
    const rutasPublicas = ['', '/', '/registro', '/administrador'];
    const esPublica = rutasPublicas.includes(cleanUrl);
    this.mostrarBarraAdmin.set(!esPublica);
  }
}
