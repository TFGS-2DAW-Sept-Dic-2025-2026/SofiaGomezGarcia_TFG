import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../servicios/auth.service';



export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica si el usuario está autenticado
  if (authService.hasValidSession()) {
    return true;
  }

  // Si no está autenticado, redirige al login
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  
  return false;
};


export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasValidSession()) {
    return true;
  }

  
  router.navigate(['/']);
  return false;
};


