import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    const rolesPermitidos = route.data['roles'] as string[] | undefined;

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(rol || '')) {
      alert('No tienes permisos para acceder a esta sección');
      this.router.navigate(rol === 'ROLE_ADMINISTRADOR' ? ['/perfil-administrador'] : ['/home']);
      return false;
    }

    return true;
  }
}
