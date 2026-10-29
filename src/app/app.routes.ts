import { Routes } from '@angular/router';
import {InicioSesionClienteComponente} from './componentes/inicio-sesion-cliente-componente/inicio-sesion-cliente-componente';
import {RegistroClienteComponente} from './componentes/registro-cliente-componente/registro-cliente-componente';
import { InicioSesionAdministradorComponente } from './componentes/inicio-sesion-administrador-componente/inicio-sesion-administrador-componente';
import { Hu11NotificacionesCliente } from './componentes/hu11-notificaciones-cliente/hu11-notificaciones-cliente';
import { Hu10HomeCliente } from './componentes/h10-home-cliente/hu10-home-cliente';
import { LandingPage } from './componentes/landing-page/landing-page';
import { Hu18ReporteIncidencia } from './componentes/hu18-reporte-incidencia/hu18-reporte-incidencia';

export const routes: Routes = [
  //4 historias de usuario
  { path: '', component: Hu18ReporteIncidencia },
  { path: '', component: LandingPage },
  { path: '', component: Hu11NotificacionesCliente },
  { path: '', component: Hu10HomeCliente },
  { path: '', component: InicioSesionClienteComponente },
  { path: 'registro', component: RegistroClienteComponente },
  { path: 'administrador', component: InicioSesionAdministradorComponente },
];
