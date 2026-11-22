import {Routes} from '@angular/router';

import {C2RegistroClienteComponente} from './componentes/c2-registro-cliente-componente/c2-registro-cliente-componente';
import {
  A1InicioSesionAdministradorComponente
} from './componentes/a1-inicio-sesion-administrador-componente/a1-inicio-sesion-administrador-componente';
import {
  C1InicioSesionClienteComponente
} from './componentes/c1-inicio-sesion-cliente-componente/c1-inicio-sesion-cliente-componente';
import {C4HomeClienteComponente} from './componentes/c4-home-cliente-componente/c4-home-cliente-componente';
import {
  C8NuevaReservaClienteComponente
} from './componentes/c8-nueva-reserva-cliente-componente/c8-nueva-reserva-cliente-componente';
import {
  C13MisReservasClienteComponente
} from './componentes/c13-mis-reservas-cliente-componente/c13-mis-reservas-cliente-componente';
import {C17PerfilClienteComponente} from './componentes/c17-perfil-cliente-componente/c17-perfil-cliente-componente';
import {AuthGuard} from './guards/auth-guard';
import {
  C19IncidentesClienteComponente
} from './componentes/c19-incidentes-cliente-componente/c19-incidentes-cliente-componente';
import {C5NotificacionesCliente} from './componentes/c5-notificaciones-cliente/c5-notificaciones-cliente';
import {LandingPage} from './componentes/landing-page/landing-page';
import {
  A2PerfilAdministradorComponente
} from './componentes/a2-perfil-administrador-componente/a2-perfil-administrador-componente';
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
import { A28ReporteReservaDeporteSedeComponente } from './componentes/a28-reporte-reserva-deporte-sede-componente/a28-reporte-reserva-deporte-sede-componente';
import { A30ReporteCancelacionesComponente } from './componentes/a30-reporte-cancelaciones-componente/a30-reporte-cancelaciones-componente';


export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'login', component: C1InicioSesionClienteComponente },
  { path: 'registro', component: C2RegistroClienteComponente },
  { path: 'administrador', component: A1InicioSesionAdministradorComponente },

  //Vistas cliente con permisos con guard
  {
    path: 'home',
    component: C4HomeClienteComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_CLIENTE'] },
  },
  {
    path: 'nueva-reserva',
    component: C8NuevaReservaClienteComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_CLIENTE'] },
  },
  {
    path: 'mis-reservas',
    component: C13MisReservasClienteComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_CLIENTE'] },
  },
  {
    path: 'perfil-cliente',
    component: C17PerfilClienteComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_CLIENTE'] },
  },
  {
    path: 'reporte-deporte-sede',
    component: A28ReporteReservaDeporteSedeComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },

  {
    path: 'incidencias-cliente',
    component: C19IncidentesClienteComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_CLIENTE'] },
  },

  {
    path: 'notificaciones-cliente',
    component: C5NotificacionesCliente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_CLIENTE'] },
  },

  // Rutas protegidas para Administrador
  {
    path: 'reporte-reservas',
    loadComponent: () =>
      import('./componentes/a28-reporte-reserva-deporte-sede-componente/a28-reporte-reserva-deporte-sede-componente').then(
        (m) => m.A28ReporteReservaDeporteSedeComponente,
      ),
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'dialogo',
    component: A11NotificacionesAdministradorComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'perfil-administrador',
    component: A2PerfilAdministradorComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'clientes',
    component: A14GestionClientesComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'reservas',
    component: A18GestionReservasComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'espacios',
    component: A22GestionEspaciosComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'solicitudes',
    component: A8GestionSolicitudesComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'reporte-financiero',
    component: A33ReporteFinancieroComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'reporte-cancelacion',
    component: A30ReporteCancelacionesComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'reporte-incidencias',
    component: A37ReporteIncidenciasComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'incidencias',
    component: A26ListadoIncidenciasAdministradorComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
  {
    path: 'notificaciones',
    component: A11NotificacionesAdministradorComponente,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMINISTRADOR'] },
  },
];
