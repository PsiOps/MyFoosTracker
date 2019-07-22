import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadingController } from '@ionic/angular';
import { PlayerService } from 'src/app/services/player.service';

@Component({
  selector: 'app-player-stats',
  templateUrl: 'player-stats.page.html',
  styleUrls: ['player-stats.page.scss']
})
export class PlayerStatsPage implements OnInit {
  private loadingIndicator: HTMLIonLoadingElement;

  public player$: Observable<{ id: string, nickname: string, photoUrl: string }>;

  constructor(
    public playerService: PlayerService,
    private loadingController: LoadingController
  ) { }

  async ngOnInit() {
    this.loadingIndicator = await this.loadingController.create({
      spinner: 'dots',
      message: 'Loading...'
    });

    await this.loadingIndicator.present();
  }

  onStatsLoaded() {
    setTimeout(async () => {
      await this.loadingController.dismiss();
    }, 500);
  }
}


