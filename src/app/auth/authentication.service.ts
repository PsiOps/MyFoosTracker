import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Player } from '../domain/player';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public user: firebase.User;
  public user$: Observable<firebase.User> = this.afAuth.authState;
  public playerDoc: AngularFirestoreDocument<Player>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
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
        // Error means player does not exist yet, so we create a new one:
        const player = new Player();
        player.nickname = 'Player1';
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

  setNickname(nickname: string): void {
    if (!this.playerDoc) { return; }
    this.playerDoc.update({ nickname: nickname });
  }

  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  logout() {
    this.user = null;
    this.playerDoc = null;
    this.afAuth.auth.signOut();
  }
}
