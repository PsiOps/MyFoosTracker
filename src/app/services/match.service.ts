import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Match, MatchStatus, Team } from '../domain/match';
import { AngularFirestoreDocument, AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Player } from '../domain/player';
import { StatsService } from './stats.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { map, switchMap, filter, tap } from 'rxjs/operators';
import { PlayerService } from './player.service';
import { SharedState } from '../state/shared.state';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  public currentMatch$: BehaviorSubject<Match> = new BehaviorSubject(null);
  private currentMatchDoc: AngularFirestoreDocument<Match>;
  public currentMatchDocRef: firebase.firestore.DocumentReference;
  public matchesOfWatchedTables$: Observable<Match[]>;

  constructor(private state: SharedState,
    private playerService: PlayerService,
    private statsService: StatsService,
    private afs: AngularFirestore) {

    const currentMatchObs$ = this.state.player$
      .pipe(filter(player => !!player))
      .pipe(filter(player => !!player.defaultGroupId))
      .pipe(switchMap(player => this.afs.collection<Match>('matches',
        ref => ref.where('status', '<', MatchStatus.over)
          .where('participants', 'array-contains', player.id)
          .where('groupId', '==', player.defaultGroupId)
          .limit(1)
      ).snapshotChanges()
        .pipe(filter(matchDocChanges => matchDocChanges.length > 0))
        .pipe(map(matchDocs => this.currentMatchDoc = this.afs.doc<Match>(matchDocs[0].payload.doc.ref.path)))
        .pipe(tap(doc => this.currentMatchDocRef = doc.ref))
        .pipe(switchMap(matchDoc => matchDoc.valueChanges())))
      );

    currentMatchObs$.subscribe(match => this.currentMatch$.next(match));

    const matchesInProgressObs$ = this.state.player$
      .pipe(filter(player => !!player))
      .pipe(filter(player => !!player.defaultGroupId))
      .pipe(switchMap(player => this.afs.collection<Match>('matches',
        ref => ref.where('status', '==', MatchStatus.started)
          .where('groupId', '==', player.defaultGroupId)
      ).valueChanges()));
    matchesInProgressObs$.subscribe(matchesInProgress => this.state.matchesInProgress$.next(matchesInProgress));
  }

  public async createMatch(player: Player) {
    const match = new Match();
    match.groupId = player.defaultGroupId;
    if (player.currentGroupDefaultTableId) {
      match.tableRef = this.afs.doc(`/groups/${player.defaultGroupId}/tables/${player.currentGroupDefaultTableId}`).ref;
    }
    match.organizer = player.id;
    match.participants.push(player.id);
    match.teamA.push({ playerRef: this.playerService.playerDocRef, goals: 0 });
    await this.afs.collection('matches').add(Object.assign({}, match));
  }
  public async startMatch() {
    await this.currentMatchDoc.update({ dateTimeStart: new Date(), status: 1 });
  }
  public async cancelMatch() {
    await this.currentMatchDoc.delete();
    this.clearMatch();
  }
  public async finishMatch() {
    await this.currentMatchDoc.update({ status: 2 });
  }
  public async saveScoreAndUpdateStats($event: { goalsTeamA: number, goalsTeamB: number }) {
    await this.currentMatchDoc.update({
      dateTimeEnd: new Date(),
      status: 3,
      goalsTeamA: $event.goalsTeamA,
      goalsTeamB: $event.goalsTeamB
    });
    this.statsService.updateStats(this.currentMatchDoc.ref.path);
    this.clearMatch();
  }
  public async reopenMatch() {
    await this.currentMatchDoc.update({ status: 1 });
  }
  public async setTable(groupId: string, tableId: string) {
    const tableRef = this.afs.doc(`groups/${groupId}/tables/${tableId}`).ref;
    await this.currentMatchDoc.ref.update({ tableRef: tableRef });
  }
  public async addTeamPlayerToMatch(playerId: string, team: Team) {
    const playerDocRef = this.afs.doc<Player>(`players/${playerId}`).ref;
    await this.addPlayerToTeam(playerDocRef, team);
  }
  public async removeTeamPlayerFromMatch(playerId: string) {
    const playerDocRef = this.afs.doc<Player>(`players/${playerId}`).ref;
    await this.leaveTeam(playerDocRef);
  }
  public async addPlayerToTeam(playerDocRef: DocumentReference, team: Team) {
    const teamPlayer = { playerRef: playerDocRef, goals: 0 };
    let payload: firebase.firestore.UpdateData;
    if (team === Team.teamA) {
      payload = {
        participants: firebase.firestore.FieldValue.arrayUnion(playerDocRef.id),
        teamA: firebase.firestore.FieldValue.arrayUnion(teamPlayer)
      };
    } else {
      payload = {
        participants: firebase.firestore.FieldValue.arrayUnion(playerDocRef.id),
        teamB: firebase.firestore.FieldValue.arrayUnion(teamPlayer)
      };
    }
    await this.currentMatchDoc.ref.update(payload);
  }
  public async leaveTeam(playerDocRef: DocumentReference) {
    const teamPlayer = { playerRef: playerDocRef, goals: 0 };
    const payload = {
      participants: firebase.firestore.FieldValue.arrayRemove(playerDocRef.id),
      teamA: firebase.firestore.FieldValue.arrayRemove(teamPlayer),
      teamB: firebase.firestore.FieldValue.arrayRemove(teamPlayer)
    };
    await this.currentMatchDoc.ref.update(payload);
  }
  public async leaveMatch(playerDocRef: DocumentReference) {
    await this.leaveTeam(playerDocRef);
    this.clearMatch();
  }
  public async dismissMatch() {
    this.clearMatch();
  }
  private clearMatch() {
    this.currentMatchDoc = null;
    this.currentMatch$.next(null);
  }
}
