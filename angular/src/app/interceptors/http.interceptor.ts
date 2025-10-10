import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../servicios/auth.service';



export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // URLs que NO necesitan token (login, register, etc.)
  const excludedUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
  const shouldSkipToken = excludedUrls.some(url => req.url.includes(url));

  // Si la petición no necesita token, la dejamos pasar
  if (shouldSkipToken) {
    return next(req);
  }

  // Añadir token a la petición
  const token = authService.getSessionToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar la respuesta y errores
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshSession().pipe(
          switchMap(() => {
            // Reintenta la petición original con el nuevo token
            const newToken = authService.getSessionToken();
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(clonedReq);
          }),
          catchError(refreshError => {
            // Si el refresh falla, hacer logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      // Otros errores se propagan
      return throwError(() => error);
    })
  );
};


