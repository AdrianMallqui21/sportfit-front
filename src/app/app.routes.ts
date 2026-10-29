import { Routes } from '@angular/router';
import { InicioSesionClienteComponente } from './componentes/inicio-sesion-cliente-componente/inicio-sesion-cliente-componente';
import { RegistroClienteComponente } from './componentes/registro-cliente-componente/registro-cliente-componente';
import { InicioSesionAdministradorComponente } from './componentes/inicio-sesion-administrador-componente/inicio-sesion-administrador-componente';
import { CancelacionesDashboardComponent } from './componentes/reportes/cancelaciones-dashboard/cancelaciones-dashboard.component';
import { ReservasClienteComponent } from './componentes/reportes/reservas-cliente/reservas-cliente.component';
import { ReporteFinancieroComponent } from './componentes/reportes/reporte-financiero/reporte-financiero.component';

export const routes: Routes = [
  { path: '', component: InicioSesionClienteComponente },
  { path: 'registro', component: RegistroClienteComponente },
  { path: 'administrador', component: InicioSesionAdministradorComponente },
  { path: 'reportes/reservas-canceladas', component: CancelacionesDashboardComponent },
  { path: 'reportes/cantidad-reservas', component: ReservasClienteComponent },
  { path: 'reportes/financiero-periodo', component: ReporteFinancieroComponent },
  { path: 'reportes-reservas-canceladas', redirectTo: 'reportes/reservas-canceladas', pathMatch: 'full' },
  { path: 'reportes-cantidad-reservas', redirectTo: 'reportes/cantidad-reservas', pathMatch: 'full' },
  { path: 'reportes-financiero-periodo', redirectTo: 'reportes/financiero-periodo', pathMatch: 'full' }
];
