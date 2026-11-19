import {Routes} from '@angular/router';
import {AuthGuard} from './guards/auth-guard';
import {C2RegistroClienteComponente} from './componentes/c2-registro-cliente-componente/c2-registro-cliente-componente';
import {
  A1InicioSesionAdministradorComponente
} from './componentes/a1-inicio-sesion-administrador-componente/a1-inicio-sesion-administrador-componente';
import {C4HomeClienteComponente} from './componentes/c4-home-cliente-componente/c4-home-cliente-componente';
import {
  A2PerfilAdministradorComponente
} from './componentes/a2-perfil-administrador-componente/a2-perfil-administrador-componente';


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
import {
  A26ListadoIncidenciasAdministradorComponente
} from './componentes/a26-listado-incidencias-administrador-componente/a26-listado-incidencias-administrador-componente';
import {
  A11NotificacionesAdministradorComponente
} from './componentes/a11-notificaciones-administrador-componente/a11-notificaciones-administrador-componente';
import {
  A18GestionReservasComponente
} from './componentes/a18-gestion-reservas-componente/a18-gestion-reservas-componente';

export const routes: Routes = [
  // Rutas públicas de acceso y registro
  {path: '', component: C1InicioSesionClienteComponente},
  {path: 'registro', component: C2RegistroClienteComponente},
  {path: 'administrador', component: A1InicioSesionAdministradorComponente},

  // Rutas protegidas para Cliente
  {path: 'home', component: C4HomeClienteComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_CLIENTE']}},

  // Rutas protegidas para Administrador
  {path: 'dialogo', component: A11NotificacionesAdministradorComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},
  {path: 'perfil-administrador', component: A2PerfilAdministradorComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},

  // Vistas de Anthony (HU04, HU05, HU14, HU13, HU07, HU18)
  {path: 'clientes', component: A14GestionClientesComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},
  {path: 'reservas', component: A18GestionReservasComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},
  {path: 'espacios', component: A22GestionEspaciosComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},
  {path: 'solicitudes', component: A8GestionSolicitudesComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},
  {path: 'reporte-financiero', component: A33ReporteFinancieroComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},
  {path: 'reporte-incidencias', component: A37ReporteIncidenciasComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},

  {path: 'incidencias', component: A26ListadoIncidenciasAdministradorComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},
  {path: 'notificaciones', component: A11NotificacionesAdministradorComponente, canActivate: [AuthGuard], data: {roles: ['ROLE_ADMINISTRADOR']}},
];
