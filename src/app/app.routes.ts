import {
  A30ReporteCancelacionesComponente
} from './componentes/a30-reporte-cancelaciones-componente/a30-reporte-cancelaciones-componente';
import {
  A28ReporteDeporteSedeComponente
} from './componentes/a28-reporte-deporte-sede-componente/a28-reporte-deporte-sede-componente';
import {Routes} from '@angular/router';
import {C2RegistroClienteComponente} from './componentes/c2-registro-cliente-componente/c2-registro-cliente-componente';
import {
  A1InicioSesionAdministradorComponente
} from './componentes/a1-inicio-sesion-administrador-componente/a1-inicio-sesion-administrador-componente';
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
import {
  A14GestionClientesComponente
} from './componentes/a14-gestion-clientes-componente/a14-gestion-clientes-componente';
import {
  A22GestionEspaciosComponente
} from './componentes/a22-gestion-espacios-componente/a22-gestion-espacios-componente';
import {
  A8GestionSolicitudesComponente
} from './componentes/a8-gestion-solicitudes-componente/a8-gestion-solicitudes-componente';
import {
  A33ReporteFinancieroComponente
} from './componentes/a33-reporte-financiero-componente/a33-reporte-financiero-componente';
import {
  A37ReporteIncidenciasComponente
} from './componentes/a37-reporte-incidencias-componente/a37-reporte-incidencias-componente';

export const routes: Routes = [
  // Ruta de prueba de la vista A28.

  {path: '', component: C1InicioSesionClienteComponente},
  {path: 'registro', component: C2RegistroClienteComponente},
  {path: 'administrador', component: A1InicioSesionAdministradorComponente},

  {path: 'home', component: C4HomeClienteComponente},
  {path: 'perfil-administrador', component: A2PerfilAdministradorComponente},
  {path: 'notificaciones', component: A11NotificacionesAdministradorComponente},
  {path: 'incidencias', component: A26ListadoIncidenciasAdministradorComponente},
  {path: 'reporte-deporte-sede', component: A28ReporteDeporteSedeComponente},
  {path: 'reporte-cancelacion', component: A30ReporteCancelacionesComponente},

  // Vistas de Anthony (HU04, HU14, HU13, HU07, HU18)
  {path: 'clientes', component: A14GestionClientesComponente},
  {path: 'espacios', component: A22GestionEspaciosComponente},
  {path: 'solicitudes', component: A8GestionSolicitudesComponente},
  {path: 'reporte-financiero', component: A33ReporteFinancieroComponente},
  {path: 'reporte-incidencias', component: A37ReporteIncidenciasComponente},
];
