import { Component } from '@angular/core';
import { AuthenticationService } from '../auth/authentication.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Match, MatchStatus, Team } from '../domain/match';
import { ToastController } from '@ionic/angular';
import { firestore } from 'firebase/app';
import { Player } from '../domain/player';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  public currentMatch$: Observable<Match> = of(null);
  private currentMatchDocument: AngularFirestoreDocument<Match>;
  public isMatchOrganiser$: Observable<boolean>;
  public isInEditMode = false;
  public gamePin?: number = null;
  constructor(public authService: AuthenticationService,
    private afs: AngularFirestore,
    private router: Router,
    private toastController: ToastController) {
    this.findCurrentMatch();
  }
  private findCurrentMatch(): void {
    const currentUserMatches = this.afs.collection<Match>('matches',
      ref => ref.where('status', '<', MatchStatus.over)
        .where('participants', 'array-contains', this.authService.user.uid)
        .limit(1)
    );
    currentUserMatches.get().subscribe(qs => {
      if (qs.docs.length === 0) { return; }
      this.currentMatchDocument = this.afs.doc<Match>(qs.docs[0].ref.path);
      this.currentMatch$ = this.currentMatchDocument.valueChanges();
    });
  }
  public async createMatch(player: Player) {
    const match = new Match();
    match.tableRef = player.defaultTableRef;
    match.organizer = this.authService.user.uid;
    match.participants.push(this.authService.user.uid);
    match.teamA.push({ playerRef: this.authService.playerDoc.ref, goals: 0 });
    const doc = await this.afs.collection('matches').add(Object.assign({}, match));
    this.currentMatchDocument = this.afs.doc<Match>(doc.path);
    this.currentMatch$ = this.currentMatchDocument.valueChanges();
  }
  public async startMatch() {
    await this.currentMatchDocument.update({ dateTimeStart: new Date(), status: 1 });
  }
  public async cancelMatch() {
    await this.currentMatchDocument.delete();
    this.clearMatch();
  }
  public async finishMatch() {
    // Show the scoring inputs
    await this.currentMatchDocument.update({ status: 2 });
  }
  public async onScored($event: { goalsTeamA: number, goalsTeamB: number }) {
    // Update the document with the teamgoals and playergoals
    await this.currentMatchDocument.update({
      dateTimeEnd: new Date(),
      status: 3,
      goalsTeamA: $event.goalsTeamA,
      goalsTeamB: $event.goalsTeamB
    });
    this.clearMatch();
  }
  public async onScoringCancelled() {
    // Hide the scoring inputs
    await this.currentMatchDocument.update({ status: 1 });
  }
  public async onMatchJoined($event: Team) {
    const teamPlayer = { playerRef: this.authService.playerDoc.ref, goals: 0 };
    let payload: firestore.UpdateData;
    if ($event === Team.teamA) {
      payload = {
        participants: firestore.FieldValue.arrayUnion(this.authService.user.uid),
        teamA: firestore.FieldValue.arrayUnion(teamPlayer)
      };
    } else {
      payload = {
        participants: firestore.FieldValue.arrayUnion(this.authService.user.uid),
        teamB: firestore.FieldValue.arrayUnion(teamPlayer)
      };
    }
    await this.currentMatchDocument.ref.update(payload);
  }
  public async leaveTeam() {
    const teamPlayer = { playerRef: this.authService.playerDoc.ref, goals: 0 };
    const payload = {
      participants: firestore.FieldValue.arrayRemove(this.authService.user.uid),
      teamA: firestore.FieldValue.arrayRemove(teamPlayer),
      teamB: firestore.FieldValue.arrayRemove(teamPlayer)
    };
    await this.currentMatchDocument.ref.update(payload);
  }
  public async leaveMatch() {
    await this.leaveTeam();
    this.clearMatch();
  }
  public async dismissMatch() {
    this.clearMatch();
  }
  public startEditMode(): void {
    this.isInEditMode = true;
  }
  public async findMatchToJoin() {
    if (!this.gamePin) { return; }
    // Get the match with the pin
    // Set as current match
    console.log(this.gamePin);
    const matchesWithPin = this.afs.collection<Match>('matches',
      ref => ref
        .where('pin', '==', Number(this.gamePin))
        .where('status', '==', MatchStatus.open)
        .limit(1)
    );
    matchesWithPin.get().subscribe(async qs => {
      console.log(qs);
      if (qs.docs.length === 0) {
        const toast = await this.toastController.create({
          message: 'No open matches found with that PIN.',
          duration: 2000,
          color: 'warning',
          animated: true,
          translucent: true
        });
        toast.present();
        return;
      }
      this.currentMatchDocument = this.afs.doc<Match>(qs.docs[0].ref.path);
      this.currentMatch$ = this.currentMatchDocument.valueChanges();
    });

  }
  public submitNickname(nickname: string): void {
    this.isInEditMode = false;
    this.authService.setNickname(nickname);
  }
  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
  private clearMatch() {
    this.currentMatchDocument = null;
    this.currentMatch$ = of(null);
    this.gamePin = null;
  }
}
