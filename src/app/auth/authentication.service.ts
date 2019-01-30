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
  public player$: Observable<Player> = of(null);
  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {

    this.user$.subscribe(u => {
      if (!u) {
        this.user = null;
        this.playerDoc = null;
        this.player$ = of(null);
        return;
      }
      this.user = u;
      this.playerDoc = this.afs.doc<Player>(`players/${u.uid}`);
      this.player$ = this.playerDoc.valueChanges();
      this.playerDoc.update({lastLogin: '2019-1-1'}).catch((error) => {
        const player = new Player();
        player.nickname = 'Player1';
        this.playerDoc.set(Object.assign({}, player));
      });
    });
  }
  login() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }
  logout() {
    this.user = null;
    this.playerDoc = null;
    this.player$ = of(null);
    this.afAuth.auth.signOut();
  }
}
