import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, tap } from "rxjs";
import { AuthService } from "../services/auth.service";

export const canActivateRoute: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
        const authService = inject(AuthService);
        const router = inject(Router);
        return authService.canActivate()
            .pipe(
                tap(isLoggedIn => {
                    if (!isLoggedIn)
                        router.navigateByUrl('/');
                })
            );
    }