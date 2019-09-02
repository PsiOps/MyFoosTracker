import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { BehaviorSubject } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public user$: BehaviorSubject<firebase.User> = new BehaviorSubject(null);

  constructor(
    private afAuth: AngularFireAuth,
    private loadingController: LoadingController
  ) {
    this.afAuth.authState
      .pipe(tap(user => console.log(user))) // TEMP, remove when done testing new user flow
      .subscribe(user => this.user$.next(user));
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
