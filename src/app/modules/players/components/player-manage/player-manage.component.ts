import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Player } from '../../../../domain';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerSelectModel } from 'src/app/modules/home/models/player-select.model';
import { PlayerService } from 'src/app/services/player.service';
import { ModalController } from '@ionic/angular';
import { StatsComponent } from 'src/app/modules/shared/components/stats/stats.component';

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
    private afs: AngularFirestore,
    private modalController: ModalController) { }

  ngOnInit() {
    const playerChanges = this.afs.collection<Player>('players').snapshotChanges();

    this.players$ =
      combineLatest([
        playerChanges,
        this.playerService.getFavourites()
      ]
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
            .sort(this.playerService.sortPlayers);
        })
      );
  }

  public playerFavouriteChanged(player: PlayerSelectModel) {
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

  public async gotoStats(player: PlayerSelectModel) {
    const modal = await this.modalController.create({
      component: StatsComponent,
      componentProps: { player: player, isModal: true }
    });
    return await modal.present();
  }
}
