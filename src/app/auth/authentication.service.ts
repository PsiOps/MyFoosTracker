import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Player } from '../domain/player';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public user: firebase.User;
  public user$: Observable<firebase.User> = this.afAuth.authState;
  public playerDoc: AngularFirestoreDocument<Player>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {

    this.user$.subscribe(u => {
      if (!u) {
        this.user = null;
        this.playerDoc = null;
        return;
      }
      this.user = u;
      this.playerDoc = this.afs.doc<Player>(`players/${u.uid}`);
      const now = new Date();
      this.playerDoc.update({ lastLogin: now }).catch((error) => {
        this.router.navigateByUrl('/welcome');
        // Error means player does not exist yet, so we create a new one:
        const player = new Player();
        player.photoUrl = u.photoURL;
        player.playerSince = now;
        player.lastLogin = now;
        player.favouritePlayerIds = [];
        player.favouriteTableIds = [];
        player.watchingTableIds = [];
        this.playerDoc.set(Object.assign({}, player));
      });
    });
  }

  public async setNickname(nickname: string): Promise<void> {
    if (!this.playerDoc) { return; }
    await this.playerDoc.update({ nickname: nickname });
  }

  login() {
    // this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
    this.afAuth.auth.signInWithRedirect(new auth.GithubAuthProvider());
  }

  logout() {
    this.user = null;
    this.playerDoc = null;
    this.afAuth.auth.signOut();
  }
}
