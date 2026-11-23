import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';
import {
  BarraLateralAdministradorComponente
} from './componentes/barra-lateral-administrador-componente/barra-lateral-administrador-componente';

@Component({
  imports: [CommonModule, RouterOutlet, BarraLateralAdministradorComponente],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  mostrarBarraAdmin = signal<boolean>(false);
  protected readonly title = signal('sporfit');
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.evaluarRuta();

    this.router.events.pipe(
      filter(evento => evento instanceof NavigationEnd),
    ).subscribe(() => this.evaluarRuta());
  }

  evaluarRuta(): void {
    const rutaActiva = this.router.routerState.snapshot.root.firstChild;
    const roles = rutaActiva?.data['roles'] as string[] | undefined;
    this.mostrarBarraAdmin.set(roles?.includes('ROLE_ADMINISTRADOR') ?? false);
  }

}
