import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  //estamos creando una logica interceptor de angular req:petición next:permite continuar el servicio
  const router = inject(Router);
  const token = localStorage.getItem('token'); //obtenemos el token
  const esApi = req.url.startsWith(environment.apiUrl);
  //identificamos las peticiones si es login o registro ya que registro no usa jwt
  const esAutenticacion = req.url.endsWith('/authenticate') || req.url.endsWith('/auth/register');

  // Agregar JWT solo a las peticiones protegidas de nuestra API
  //si existe el token y no estamos haciendo login o registro, agregamos la cabecera
  //usamos req.clone() por peticiones HTTP
  const authReq =
    esApi && token && !esAutenticacion //exite token?
      ? req.clone({ //usamos esto porque no podemos modificar
      // formato de la cabecera, Bearer: indica que enviamos un token
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        })
      : req;

  if (isDevMode()) { //mostramos información en la consola
    console.log('[Interceptor]', req.method, req.url);
    console.log('Token adjuntado:', esApi && !!token && !esAutenticacion);
  }

  //Enviamos la petición y capturamos errores
  return next(authReq).pipe(
    catchError((error) => {
      switch (error.status) {
        case HttpStatusCode.Unauthorized: //en caso de errores no esta utentificado correctamente
          if (!esAutenticacion) {
            //eliminamos casos de token expirado, token invalido o usuario no presento un token valido
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            localStorage.removeItem('correo');
            localStorage.removeItem('idRol');

            router.navigate(['/login']);
          }
          break;
        //Error 403 no tiene permisos para acceder al recurso
        case HttpStatusCode.Forbidden:
          if (isDevMode()) {
            console.warn('Acceso denegado:', req.url);
          }
          break;
      }
      //devolver el error
      return throwError(() => error);
    }),
  );
};
