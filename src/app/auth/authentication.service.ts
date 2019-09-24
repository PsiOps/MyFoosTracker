import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/auth';
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

  public async loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return await this.login(provider);
  }

  public async loginWithGithub() {
    const provider = new firebase.auth.GithubAuthProvider();
    return await this.login(provider);
  }

  public async loginWithTwitter() {
    const provider = new firebase.auth.TwitterAuthProvider();
    return await this.login(provider);
  }

  public async loginWithFacebook() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return await this.login(provider);
  }

  private async login(provider: firebase.auth.AuthProvider) {
    const loading = await this.loadingController.create({
      message: 'Logging in...',
      translucent: true
    });
    loading.present()
      .then(() => this.afAuth.auth.signInWithRedirect(provider));
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
