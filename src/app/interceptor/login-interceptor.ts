import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const esAutenticacion = req.url.endsWith('/authenticate') || req.url.endsWith('/auth/register');

  // Agregar JWT solo a las peticiones protegidas
  const authReq =
    token && !esAutenticacion
      ? req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        })
      : req;

  if (isDevMode()) {
    console.log('[Interceptor]', req.method, req.url);
    console.log('Token adjuntado:', !!token && !esAutenticacion);
  }

  return next(authReq).pipe(
    catchError((error) => {
      switch (error.status) {
        case HttpStatusCode.Unauthorized:
          if (!esAutenticacion) {
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            localStorage.removeItem('correo');
            localStorage.removeItem('idRol');

            router.navigate(['/']);
          }
          break;

        case HttpStatusCode.Forbidden:
          if (isDevMode()) {
            console.warn('Acceso denegado:', req.url);
          }
          break;
      }

      return throwError(() => error);
    }),
  );
};
