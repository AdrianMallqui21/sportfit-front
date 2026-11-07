import {
  A30ReporteCancelacionesComponente
} from './componentes/a30-reporte-cancelaciones-componente/a30-reporte-cancelaciones-componente';
import {
  A28ReporteDeporteSedeComponente
} from './componentes/a28-reporte-deporte-sede-componente/a28-reporte-deporte-sede-componente';
import {Routes} from '@angular/router';
import {RegistroClienteComponente} from './componentes/registro-cliente-componente/registro-cliente-componente';
import {
  InicioSesionAdministradorComponente
} from './componentes/inicio-sesion-administrador-componente/inicio-sesion-administrador-componente';
import {C4HomeClienteComponente} from './componentes/c4-home-cliente-componente/c4-home-cliente-componente';
import {
  A2PerfilAdministradorComponente
} from './componentes/a2-perfil-administrador-componente/a2-perfil-administrador-componente';

import {
  A11NotificacionesAdministradorComponente
} from './componentes/a11-notificaciones-administrador-componente/a11-notificaciones-administrador-componente';

import {
  A26ListadoIncidenciasAdministradorComponente
} from './componentes/a26-listado-incidencias-administrador-componente/a26-listado-incidencias-administrador-componente';
import {
  C1InicioSesionClienteComponente
} from './componentes/c1-inicio-sesion-cliente-componente/c1-inicio-sesion-cliente-componente';

export const routes: Routes = [
  // Ruta de prueba de la vista A28.

  {path: '', component: C1InicioSesionClienteComponente},
  {path: 'registro', component: RegistroClienteComponente},
  {path: 'administrador', component: InicioSesionAdministradorComponente},

  {path: 'home', component: C4HomeClienteComponente},
  {path: 'perfil-administrador', component: A2PerfilAdministradorComponente},
  {path: 'notificaciones', component: A11NotificacionesAdministradorComponente},
  {path: 'incidencias', component: A26ListadoIncidenciasAdministradorComponente},
  {path: 'reporte-deporte-sede', component: A28ReporteDeporteSedeComponente},
  {path: 'reporte-cancelacion', component: A30ReporteCancelacionesComponente},
];

