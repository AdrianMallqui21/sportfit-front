import { Routes } from '@angular/router';
import {InicioSesionClienteComponente} from './componentes/inicio-sesion-cliente-componente/inicio-sesion-cliente-componente';
import {RegistroClienteComponente} from './componentes/registro-cliente-componente/registro-cliente-componente';
import {
  InicioSesionAdministradorComponente
} from './componentes/inicio-sesion-administrador-componente/inicio-sesion-administrador-componente';
import { NuevaReservaComponente } from './componentes/nueva-reserva-componente/nueva-reserva-componente';
import {
  BarraLateralClienteComponente
} from './componentes/barra-lateral-cliente-componente/barra-lateral-cliente-componente';
import {
  NotificacionesClienteComponente
} from './componentes/notificaciones-cliente-componente/notificaciones-cliente-componente';
import {
  MisReservasClienteComponente
} from './componentes/mis-reservas-cliente-componente/mis-reservas-cliente-componente';
import {
  GestionIncidenciasAdministradorComponente
} from './componentes/gestion-incidencias-administrador-componente/gestion-incidencias-administrador-componente';
import {
  IncidenciasClienteComponente
} from './componentes/incidencias-cliente-componente/incidencias-cliente-componente';

export const routes: Routes = [
  {path: '', component: InicioSesionClienteComponente},
  {path: 'registro', component: RegistroClienteComponente},
  {path: 'administrador', component: InicioSesionAdministradorComponente},
  {path: 'c8', component: NuevaReservaComponente},
  {path: 'barraCliente', component: BarraLateralClienteComponente},
  {path: 'c5', component: NotificacionesClienteComponente},
  {path: 'c13', component: MisReservasClienteComponente},
  {path: 'a26', component: GestionIncidenciasAdministradorComponente},
  {path: 'c19', component: IncidenciasClienteComponente}
];
