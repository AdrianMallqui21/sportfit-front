import { Routes } from '@angular/router';
import {InicioSesionClienteComponente} from './componentes/inicio-sesion-cliente-componente/inicio-sesion-cliente-componente';
import {RegistroClienteComponente} from './componentes/registro-cliente-componente/registro-cliente-componente';
import {
  InicioSesionAdministradorComponente
} from './componentes/inicio-sesion-administrador-componente/inicio-sesion-administrador-componente';

export const routes: Routes = [
  {path: '', component: InicioSesionClienteComponente},
  {path: 'registro', component: RegistroClienteComponente},
  {path: 'administrador', component: InicioSesionAdministradorComponente}
];
