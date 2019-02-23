import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Player, Team, Match } from '../../../../domain';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { PlayerSelectModel } from './player-select.model';
import { ModalController } from '@ionic/angular';
import { MatchService } from 'src/app/services/match.service';

@Component({
  selector: 'app-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss']
})
export class PlayerSelectComponent implements OnInit {
  public players: AngularFirestoreCollection<Player>;
  public players$: Observable<PlayerSelectModel[]>;
  public selectedTeam: Team = Team.teamA;
  public selectedTeam$: BehaviorSubject<Team>;
  public isTeamFull$: Observable<boolean>;
  public terms = '';
  private matchDoc: AngularFirestoreDocument<Match>;
  constructor(private matchService: MatchService,
    private afs: AngularFirestore,
    private modalController: ModalController) { }
  ngOnInit() {
    this.matchDoc = this.matchService.currentMatchDocument;
    this.selectedTeam$ = new BehaviorSubject(0);
    this.isTeamFull$ = combineLatest(this.matchDoc.valueChanges(), this.selectedTeam$)
      .pipe(map(m => {
        const match = m[0]; const team = m[1];
        if (!match) { return true; }
        return team === Team.teamA ? match.teamA.length === 2 : match.teamB.length === 2;
      }));
    this.players = this.afs.collection<Player>('players');
    const playerChanges = this.players.snapshotChanges();
    this.players$ = combineLatest(playerChanges, this.selectedTeam$)
      .pipe(withLatestFrom(this.matchDoc.valueChanges()))
      .pipe(map(ps => {
        const playerDocs = ps[0][0]; const team = ps[0][1]; const match = ps[1];
        return playerDocs
          .map(p => {
            const playerDoc = p.payload.doc;
            const playerSelectModel = new PlayerSelectModel();
            playerSelectModel.id = playerDoc.id;
            playerSelectModel.nickname = playerDoc.data().nickname;
            playerSelectModel.isSelected = this.isInSelectedTeam(playerDoc.id, team, match);
            playerSelectModel.isOrganizer = playerDoc.id === match.organizer;
            return playerSelectModel;
          })
          .filter(p => this.isNotInOtherTeam(p, team, match))
          .sort(this.sortPlayers);
      }));
  }
  public selectedTeamChanged($event: CustomEvent) {
    this.selectedTeam = $event.detail.value as Team;
    this.selectedTeam$.next(Number($event.detail.value));
  }
  public checkboxChanged(player: PlayerSelectModel) {
    if (player.isSelected) {
      this.matchService.addTeamPlayerToMatch(player.id, Number(this.selectedTeam));
    } else {
      this.matchService.removeTeamPlayerFromMatch(player.id);
    }
  }
  public dismiss(): void {
    this.modalController.dismiss();
  }
  private isInSelectedTeam(playerId: string, team: Team, match: Match): boolean {
    return team === Team.teamA ? match.teamA.map(p => p.playerRef.id).indexOf(playerId) >= 0
      : match.teamB.map(p => p.playerRef.id).indexOf(playerId) >= 0;
  }
  private sortPlayers(a: PlayerSelectModel, b: PlayerSelectModel): number {
    return b.isSelected === a.isSelected ? Number(b.isOrganizer) - Number(a.isOrganizer)
      : Number(b.isSelected) - Number(a.isSelected);
  }
  private isNotInOtherTeam(player: PlayerSelectModel, team: Team, match: Match): boolean {
    return team === Team.teamA ? match.teamB.map(p => p.playerRef.id).indexOf(player.id) === -1
      : match.teamA.map(p => p.playerRef.id).indexOf(player.id) === -1;
  }
}
