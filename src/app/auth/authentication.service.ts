import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public user$: BehaviorSubject<firebase.User> = new BehaviorSubject(null);

  constructor(
    private afAuth: AngularFireAuth,
    private loadingController: LoadingController
  ) {
    this.afAuth.authState.subscribe(user => this.user$.next(user));
  }

  async login() {
    this.afAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider());
    const loading = await this.loadingController.create({
      message: 'Logging in...',
      translucent: true
    });
    await loading.present();
  }

  logout() {
    this.user$.next(null);
    this.afAuth.auth.signOut();
  }
}
