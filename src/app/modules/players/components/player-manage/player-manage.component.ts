import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Player } from '../../../../domain';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerSelectModel } from 'src/app/modules/tab1/models/player-select.model';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player-manage',
  templateUrl: './player-manage.component.html',
  styleUrls: ['./player-manage.component.scss']
})
export class PlayerManageComponent implements OnInit {
  public players$: Observable<PlayerSelectModel[]>;
  public terms = '';

  constructor(
    private playerService: PlayerService,
    private afs: AngularFirestore) { }

  ngOnInit() {
    const playerChanges = this.afs.collection<Player>('players').snapshotChanges();

    this.players$ =
      combineLatest(
        playerChanges,
        this.playerService.getFavourites()
      ).pipe(
        map(ps => {
          const playerDocs = ps[0];
          const playerFavourites = ps[1];
          return playerDocs
            .map((p) => {
              const playerDoc = p.payload.doc;
              const player = playerDoc.data();
              const playerSelectModel = new PlayerSelectModel();
              playerSelectModel.id = playerDoc.id;
              playerSelectModel.nickname = player.nickname;
              playerSelectModel.isFavourite = playerFavourites && playerFavourites
                .some((favouriteId: string) => favouriteId === playerDoc.id);
              playerSelectModel.photoUrl = player.photoUrl;
              return playerSelectModel;
            })
            .sort(this.sortPlayers);
        })
      );
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

  private sortPlayers(a: PlayerSelectModel, b: PlayerSelectModel): number {
    const aScore = (a.isFavourite ? 1 : 0);
    const bScore = (b.isFavourite ? 1 : 0);

    if (aScore < bScore) { return 1; }
    if (aScore > bScore) { return -1; }
    if (a.nickname < b.nickname) { return -1; }
    if (a.nickname > b.nickname) { return 1; }
    return 0;
  }
}
