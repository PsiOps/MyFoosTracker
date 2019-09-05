import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { ReplaySubject } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public user$: ReplaySubject<firebase.User> = new ReplaySubject();
  private _isLoggedIn$: ReplaySubject<boolean> = new ReplaySubject(1);
  public get isLoggedIn$() { return this._isLoggedIn$.asObservable(); }
  constructor(
    private afAuth: AngularFireAuth,
    private loadingController: LoadingController
  ) {
    this.afAuth.authState
      .subscribe(user => {
        this.user$.next(user);
        const isLoggedIn: boolean = user !== null;
        this._isLoggedIn$.next(isLoggedIn);
      });
  }

  public async login() {
    const loading = await this.loadingController.create({
      message: 'Logging in...',
      translucent: true
    });
    loading.present()
      .then(() => this.afAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider()));
  }

  public async logout() {
    const loading = await this.loadingController.create({
      message: 'Logging you out...',
      translucent: true
    });
    loading.present()
      .then(() => this.afAuth.auth.signOut());
  }
}
