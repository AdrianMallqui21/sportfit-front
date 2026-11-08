import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const autorizacionInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const esApi = req.url.startsWith(environment.apiUrl);
  const esAcceso = req.url.includes('/authenticate') || req.url.includes('/auth/register');

  if (esApi && !esAcceso && token) {
    const clon = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clon);
  }

  return next(req);
};
