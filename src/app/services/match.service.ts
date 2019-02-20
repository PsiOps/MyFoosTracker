import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Match, MatchStatus, Team } from '../domain/match';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';
import { Player } from '../domain/player';
import { AuthenticationService } from '../auth/authentication.service';
import { StatsService } from './stats.service';
import { firestore } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  public currentMatch$: Observable<Match> = of(null);
  private currentMatchDocument: AngularFirestoreDocument<Match>;

  constructor(private authService: AuthenticationService,
    private statsService: StatsService,
    private afs: AngularFirestore) { }

  public findCurrentMatch(): void {
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
    await this.currentMatchDocument.update({ status: 2 });
  }
  public async onScored($event: { goalsTeamA: number, goalsTeamB: number }) {
    await this.currentMatchDocument.update({
      dateTimeEnd: new Date(),
      status: 3,
      goalsTeamA: $event.goalsTeamA,
      goalsTeamB: $event.goalsTeamB
    });
    this.statsService.updateStats(this.currentMatchDocument.ref.path);
    this.clearMatch();
  }
  public async onScoringCancelled() {
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
  public async findMatchToJoin(gamePin: number, notFoundAction: () => void) {
    const matchesWithPin = this.afs.collection<Match>('matches',
      ref => ref
        .where('pin', '==', Number(gamePin))
        .where('status', '==', MatchStatus.open)
        .limit(1)
    );
    matchesWithPin.get().subscribe(async qs => {
      if (qs.docs.length === 0) {
        notFoundAction();
        return;
      }
      this.currentMatchDocument = this.afs.doc<Match>(qs.docs[0].ref.path);
      this.currentMatch$ = this.currentMatchDocument.valueChanges();
    });
  }
  private clearMatch() {
    this.currentMatchDocument = null;
    this.currentMatch$ = of(null);
  }
}
