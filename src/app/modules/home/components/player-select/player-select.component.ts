import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Player, Team, Match } from '../../../../domain';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { PlayerSelectModel } from 'src/app/modules/home/models/player-select.model';
import { ModalController } from '@ionic/angular';
import { MatchService } from 'src/app/services/match.service';
import { PlayerService } from 'src/app/services/player.service';
import { GroupService } from 'src/app/services/group.service';

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

  constructor(
    private matchService: MatchService,
    private playerService: PlayerService,
    private groupService: GroupService,
    private modalController: ModalController) { }

  ngOnInit() {
    this.selectedTeam$ = new BehaviorSubject(0);
    this.isTeamFull$ = combineLatest([
      this.matchService.currentMatch$,
      this.selectedTeam$
    ])
      .pipe(map(m => {
        const match = m[0]; const team = m[1];
        if (!match) { return true; }
        return team === Team.teamA ? match.teamA.length === 2 : match.teamB.length === 2;
      }));

    this.players$ =
      combineLatest([
        this.groupService.currentGroupMembers$,
        this.selectedTeam$,
        this.playerService.getFavourites()
      ]).pipe(
        withLatestFrom(
          this.matchService.currentMatch$
        )
      ).pipe(
        map(ps => {
          const players = ps[0][0];
          const team = ps[0][1];
          const playerFavourites = ps[0][2];
          const match = ps[1];

          return players
            .map((player) => {
              const playerSelectModel = new PlayerSelectModel();
              playerSelectModel.id = player.id;
              playerSelectModel.nickname = player.nickname;
              playerSelectModel.isSelected = this.isInSelectedTeam(player.id, team, match);
              playerSelectModel.isOrganizer = player.id === match.organizer;
              playerSelectModel.isFavourite = playerFavourites && playerFavourites
                .some((favouriteId: string) => favouriteId === player.id);
              playerSelectModel.photoUrl = player.photoUrl;
              return playerSelectModel;
            })
            .filter(p => this.isNotInOtherTeam(p, team, match))
            .sort(this.playerService.sortPlayers);
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

  public isCurrentUser(playerId: string): boolean {
    return this.playerService.isCurrentUser(playerId);
  }

  public dismiss(): void {
    this.modalController.dismiss();
  }

  private isInSelectedTeam(playerId: string, team: Team, match: Match): boolean {
    return team === Team.teamA ? match.teamA.map(p => p.playerRef.id).indexOf(playerId) >= 0
      : match.teamB.map(p => p.playerRef.id).indexOf(playerId) >= 0;
  }

  private isNotInOtherTeam(player: PlayerSelectModel, team: Team, match: Match): boolean {
    return team === Team.teamA ? match.teamB.map(p => p.playerRef.id).indexOf(player.id) === -1
      : match.teamA.map(p => p.playerRef.id).indexOf(player.id) === -1;
  }
}
