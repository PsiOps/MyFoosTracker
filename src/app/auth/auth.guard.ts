import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthenticationService, private router: Router) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    console.log('AuthGuard: Checking logged in user');
    return this.authService.isLoggedIn$
      .pipe(tap(isLoggedIn => {
        if (!isLoggedIn) {
          console.log('AuthGuard: No logged in user, navigating to login');
          localStorage.setItem('returnUrl', state.url);
          this.router.navigateByUrl('/login');
        } else {
          console.log('AuthGuard: Logged in user found, carry on');
        }
      }));
  }
}
