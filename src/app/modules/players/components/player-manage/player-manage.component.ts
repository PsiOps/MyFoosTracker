import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayerSelectModel } from 'src/app/modules/home/models/player-select.model';
import { PlayerService } from 'src/app/services/player.service';
import { ModalController } from '@ionic/angular';
import { StatsComponent } from 'src/app/modules/shared/components/stats/stats.component';
import { GroupService } from 'src/app/services/group.service';

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
    private groupService: GroupService,
    private modalController: ModalController) { }

  ngOnInit() {

    this.players$ =
      combineLatest([
        this.groupService.currentGroupMembers$,
        this.playerService.getFavourites()
      ]
      ).pipe(
        map(ps => {
          const playerDocs = ps[0];
          const playerFavourites = ps[1];
          return playerDocs
            .map((player) => {
              const playerSelectModel = new PlayerSelectModel();
              playerSelectModel.id = player.id;
              playerSelectModel.nickname = player.nickname;
              playerSelectModel.isFavourite = playerFavourites && playerFavourites
                .some((favouriteId: string) => favouriteId === player.id);
              playerSelectModel.photoUrl = player.photoUrl;
              return playerSelectModel;
            })
            .sort(this.playerService.sortPlayers);
        })
      );
  }

  public playerFavouriteChanged(player: PlayerSelectModel, $event: Event) {
    $event.stopPropagation();
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
