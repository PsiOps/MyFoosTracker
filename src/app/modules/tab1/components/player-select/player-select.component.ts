import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Player, Team, Match } from '../../../../domain';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, withLatestFrom, catchError } from 'rxjs/operators';
import { PlayerSelectModel } from 'src/app/modules/tab1/models/player-select.model';
import { ModalController } from '@ionic/angular';
import { MatchService } from 'src/app/services/match.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss']
})
export class PlayerSelectComponent implements OnInit {
  public players$: Observable<PlayerSelectModel[]>;
  public selectedTeam: Team = Team.teamA;
  public selectedTeam$: BehaviorSubject<Team>;
  public isTeamFull$: Observable<boolean>;
  public terms = '';
  private matchDoc: AngularFirestoreDocument<Match>;

  constructor(
    private matchService: MatchService,
    private playerService: PlayerService,
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

    const playerChanges = this.afs.collection<Player>('players').snapshotChanges();

    this.players$ =
      combineLatest(
        playerChanges,
        this.selectedTeam$,
        this.playerService.getFavourites()
      ).pipe(
        withLatestFrom(
          this.matchDoc.valueChanges()
        )
      ).pipe(
        map(ps => {
          const playerDocs = ps[0][0];
          const team = ps[0][1];
          const playerFavourites = ps[0][2];
          const match = ps[1];

          return playerDocs
            .map((p) => {
              const playerDoc = p.payload.doc;
              const player = playerDoc.data();
              const playerSelectModel = new PlayerSelectModel();
              playerSelectModel.id = playerDoc.id;
              playerSelectModel.nickname = player.nickname;
              playerSelectModel.isSelected = this.isInSelectedTeam(playerDoc.id, team, match);
              playerSelectModel.isOrganizer = playerDoc.id === match.organizer;
              playerSelectModel.isFavourite = playerFavourites && playerFavourites
                .some((favouriteId: string) => favouriteId === playerDoc.id);
              playerSelectModel.photoUrl = player.photoUrl;
              return playerSelectModel;
            })
            .filter(p => this.isNotInOtherTeam(p, team, match))
            .sort(this.sortPlayers);
        })
      );
  }

  public selectedTeamChanged($event: CustomEvent) {
    this.selectedTeam = $event.detail.value as Team;
    this.selectedTeam$.next(Number($event.detail.value));
  }

  public playerSelectionChanged(player: PlayerSelectModel) {
    if (player.isSelected) {
      this.matchService.addTeamPlayerToMatch(player.id, Number(this.selectedTeam));
    } else {
      this.matchService.removeTeamPlayerFromMatch(player.id);
    }
  }

  public playerFavouriteChanged(player: PlayerSelectModel) {
    if (player.isOrganizer) {
      return;
    }

    player.isFavourite = !player.isFavourite;

    if (player.isFavourite) {
      this.playerService.addPlayerToFavourites(player.id);
    } else {
      this.playerService.removePlayerFromFavourites(player.id);
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
    const aScore = (a.isOrganizer ? 1 : 0) + (a.isSelected ? 1 : 0) + (a.isFavourite ? 1 : 0);
    const bScore = (b.isOrganizer ? 1 : 0) + (b.isSelected ? 1 : 0) + (b.isFavourite ? 1 : 0);

    if (aScore < bScore) { return 1; }
    if (aScore > bScore) { return -1; }
    if (a.nickname < b.nickname) { return -1; }
    if (a.nickname > b.nickname) { return 1; }
    return 0;
}

  private isNotInOtherTeam(player: PlayerSelectModel, team: Team, match: Match): boolean {
    return team === Team.teamA ? match.teamB.map(p => p.playerRef.id).indexOf(player.id) === -1
      : match.teamA.map(p => p.playerRef.id).indexOf(player.id) === -1;
  }
}
