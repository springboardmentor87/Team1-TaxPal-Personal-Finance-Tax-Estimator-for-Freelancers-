import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);

    const token = authService.getToken();

    console.log('Interceptor Token:', token);

    // Token nahi hai to request normally bhejo
    if (!token) {
        return next(req);
    }

    // Token hai to Authorization header add karo
    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    console.log(
        'Authorization Header Added'
    );

    return next(authReq);
};