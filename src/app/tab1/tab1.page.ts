import { Component } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Player } from '../domain/player';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Match, MatchStatus } from '../domain/match';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public currentMatch$: Observable<Match>;
  constructor(public authService: AuthenticationService, private afs: AngularFirestore, private router: Router) {
    this.findCurrentMatch();
  }
  private findCurrentMatch(): void {
    const openUserMatches = this.afs.collection<Match>('matches',
      ref => ref.where('status', '==', MatchStatus.open)
        .where('participants', 'array-contains', this.authService.user.uid)
        .limit(1)
    );
    openUserMatches.get().subscribe(qs => {
      this.currentMatch$ = this.afs.doc<Match>(qs.docs[0].ref.path).valueChanges();
    });
  }
  public async createMatch() {
    const match = new Match();
    match.participants.push(this.authService.user.uid);
    match.teamAPlayer1 = { playerRef: this.authService.playerDoc.ref, goals: 0 };
    const doc = await this.afs.collection('matches').add(Object.assign({}, match));
    const matchDocument = this.afs.doc<Match>(doc.path);
    this.currentMatch$ = matchDocument.valueChanges();
  }
  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
