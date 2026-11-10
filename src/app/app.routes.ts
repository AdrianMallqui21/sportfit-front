import {Routes} from '@angular/router';
import { A30ReporteCancelacionesComponente } from './componentes/a30-reporte-cancelaciones-componente/a30-reporte-cancelaciones-componente';
import { A28ReporteDeporteSedeComponente } from './componentes/a28-reporte-deporte-sede-componente/a28-reporte-deporte-sede-componente';
import {C2RegistroClienteComponente} from './componentes/c2-registro-cliente-componente/c2-registro-cliente-componente';
import { A1InicioSesionAdministradorComponente } from './componentes/a1-inicio-sesion-administrador-componente/a1-inicio-sesion-administrador-componente';
import { A2PerfilAdministradorComponente } from './componentes/a2-perfil-administrador-componente/a2-perfil-administrador-componente';
import { A11NotificacionesAdministradorComponente } from './componentes/a11-notificaciones-administrador-componente/a11-notificaciones-administrador-componente';
import { A26ListadoIncidenciasAdministradorComponente } from './componentes/a26-listado-incidencias-administrador-componente/a26-listado-incidencias-administrador-componente';
import { C1InicioSesionClienteComponente } from './componentes/c1-inicio-sesion-cliente-componente/c1-inicio-sesion-cliente-componente';
import { C4HomeClienteComponente } from './componentes/c4-home-cliente-componente/c4-home-cliente-componente';
import { C8NuevaReservaClienteComponente } from './componentes/c8-nueva-reserva-cliente-componente/c8-nueva-reserva-cliente-componente';
import { C13MisReservasClienteComponente } from './componentes/c13-mis-reservas-cliente-componente/c13-mis-reservas-cliente-componente';
import { C17PerfilClienteComponente } from './componentes/c17-perfil-cliente-componente/c17-perfil-cliente-componente';


export const routes: Routes = [
  { path: '', component: C1InicioSesionClienteComponente },
  { path: 'registro', component: C2RegistroClienteComponente },
  { path: 'administrador', component: A1InicioSesionAdministradorComponente },
  { path: 'perfil-administrador', component: A2PerfilAdministradorComponente },
  { path: 'notificaciones', component: A11NotificacionesAdministradorComponente },
  { path: 'incidencias', component: A26ListadoIncidenciasAdministradorComponente },
  { path: 'reporte-deporte-sede', component: A28ReporteDeporteSedeComponente },
  { path: 'reporte-cancelacion', component: A30ReporteCancelacionesComponente },
  { path: 'home', component: C4HomeClienteComponente },
  { path: 'nueva-reserva', component: C8NuevaReservaClienteComponente },
  { path: 'mis-reservas', component: C13MisReservasClienteComponente },
  { path: 'perfil-cliente', component: C17PerfilClienteComponente }
];

